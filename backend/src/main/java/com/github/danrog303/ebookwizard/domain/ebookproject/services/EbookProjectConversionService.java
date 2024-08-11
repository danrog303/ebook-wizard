package com.github.danrog303.ebookwizard.domain.ebookproject.services;

import com.github.danrog303.ebookwizard.domain.ebook.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFileLock;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFileRepository;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectRepository;
import com.github.danrog303.ebookwizard.external.document.converter.DocumentConverter;
import com.github.danrog303.ebookwizard.external.document.metadata.DocumentMetadata;
import com.github.danrog303.ebookwizard.external.document.metadata.DocumentMetadataManipulator;
import com.github.danrog303.ebookwizard.external.document.thumbnail.DocumentThumbnailManipulator;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import com.github.danrog303.epubify.compiler.epub.EpubCompiler;
import com.github.danrog303.epubify.models.Ebook;
import com.github.danrog303.epubify.models.EbookOptions;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class EbookProjectConversionService {
    private final EbookProjectRepository ebookProjectRepository;
    private final EbookFileRepository ebookFileRepository;
    private final FileStorageService fileStorageService;
    private final DocumentMetadataManipulator metadataManipulator;
    private final DocumentConverter documentConverter;
    private final DocumentThumbnailManipulator documentThumbnailManipulator;

    @SneakyThrows(IOException.class)
    public void convertEbookProjectToPhysicalFile(EbookProject sourceProject, Path targetPath) {
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            var epubFilePath = tempDir.getDirectory().resolve("out.epub");
            createEpubFromEbookProject(sourceProject, tempDir.getDirectory(), epubFilePath);

            if (targetPath.toString().toLowerCase().endsWith("epub")) {
                Files.copy(epubFilePath, targetPath);
            } else {
                documentConverter.convertDocument(epubFilePath, targetPath);
            }

            applyCoverImageToEbook(sourceProject, tempDir.getDirectory(), targetPath);
        }
    }

    @SneakyThrows(IOException.class)
    private void createEpubFromEbookProject(EbookProject sourceProject, Path workDir, Path epubOutPath) {
        var ebook = new Ebook();
        ebook.setName(sourceProject.getName());
        ebook.setAuthor(sourceProject.getAuthor());
        ebook.setDescription(sourceProject.getDescription());

        var illustrationList = new ArrayList<Path>();
        for (var illustration : sourceProject.getIllustrations()) {
            var illustrationExtension = illustration.getFileKey().substring(illustration.getFileKey().lastIndexOf(".") + 1);
            var illustrationFilePath = workDir.resolve(illustration.getStub() + "." + illustrationExtension);
            Files.copy(fileStorageService.downloadFile(illustration.getFileKey()), illustrationFilePath);
            illustrationList.add(illustrationFilePath);
        }

        for (var chapter : sourceProject.getChapters()) {
            var chapterName = chapter.getName();
            var chapterContent = chapter.getContentHtml();

            String regex = "<img\\s+[^>]*src=\"([^\"]*)\"\\s+[^>]*alt=\"([^\"]*)\"";
            Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(chapterContent);

            while (matcher.find()) {
                String src = matcher.group(1);
                String alt = matcher.group(2);
                log.debug("Found image with src: {} and alt: {}", src, alt);

                var illustrationPath = illustrationList.stream()
                        .filter(path -> path.getFileName().toString().contains(alt))
                        .findFirst()
                        .orElseThrow();

                chapterContent = chapterContent.replace(src, illustrationPath.toAbsolutePath().toString());
            }

            ebook.addChapter(chapterName, chapterContent);
        }

        var ebookOptions = new EbookOptions();
        var epubCompiler = new EpubCompiler(ebookOptions);

        epubCompiler.compile(ebook, epubOutPath.toString());

        // Set remaining metadata that is not supported by "epubify" library
        var documentMetadata = new DocumentMetadata(sourceProject.getName(), sourceProject.getAuthor(),
                sourceProject.getDescription(), sourceProject.getTags());
        metadataManipulator.setDocumentMetadata(epubOutPath, documentMetadata);
    }

    @SneakyThrows(IOException.class)
    private void applyCoverImageToEbook(EbookProject sourceProject, Path workDir, Path workFile) {
        if (sourceProject.getCoverImageKey() != null) {
            var coverImageKey = sourceProject.getCoverImageKey();
            var coverImageExtension = coverImageKey.substring(coverImageKey.lastIndexOf(".") + 1);

            var coverFilePath = workDir.resolve("cover." + coverImageExtension);
            Files.copy(fileStorageService.downloadFile(coverImageKey), coverFilePath);
            documentThumbnailManipulator.setThumbnail(workFile, coverFilePath);
        }
    }

    @SneakyThrows(IOException.class)
    public void convertEbookProjectToEbookFile(String ebookProjectId, String targetFormat) {
        EbookProject sourceProject = ebookProjectRepository.findById(ebookProjectId).orElseThrow();
        targetFormat = targetFormat.toLowerCase();

        EbookFile newFile = new EbookFile();
        newFile.setAuthor(sourceProject.getAuthor());
        newFile.setName(sourceProject.getName());
        newFile.setDescription(sourceProject.getDescription());
        newFile.setTags(sourceProject.getTags());
        newFile.setPublic(false);
        newFile.setId(null);
        newFile.setEditLock(new EbookFileLock(false, null));
        newFile.setOwnerUserId(sourceProject.getOwnerUserId());
        newFile.setFavorite(false);
        newFile.setCreationDate(new Date());
        newFile.setContainerName("");

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            if (sourceProject.getCoverImageKey() != null) {
                String randomKey = RandomStringUtils.randomAlphanumeric(64);
                String newFileCoverImageKey = "ebook-files/covers/%s/%s.jpg"
                        .formatted(sourceProject.getOwnerUserId(), randomKey);

                Path coverImagePath = tempDir.getDirectory().resolve("cover.jpg");
                Files.copy(fileStorageService.downloadFile(sourceProject.getCoverImageKey()), coverImagePath);
                fileStorageService.uploadFile(newFileCoverImageKey, coverImagePath.toFile());

                newFile.setCoverImageKey(newFileCoverImageKey);
            }

            Path targetPath = tempDir.getDirectory().resolve("out." + targetFormat);
            convertEbookProjectToPhysicalFile(sourceProject, targetPath);

            String randomKey = RandomStringUtils.randomAlphanumeric(64);
            String newFileKey = "ebook-files/%s/%s.%s"
                    .formatted(sourceProject.getOwnerUserId(), randomKey, targetFormat);
            fileStorageService.uploadFile(newFileKey, targetPath.toFile());

            newFile.setDownloadableFiles(List.of(new EbookDownloadableResource(
                    RandomStringUtils.randomAlphanumeric(64),
                    EbookFormat.fromExtension(targetFormat),
                    new Date(),
                    newFileKey
            )));
        }

        ebookFileRepository.save(newFile);
    }
}
