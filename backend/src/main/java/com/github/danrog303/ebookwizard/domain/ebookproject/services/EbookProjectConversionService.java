package com.github.danrog303.ebookwizard.domain.ebookproject.services;

import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
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
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class EbookProjectConversionService {
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

            // Find occurrences of !!!ILLUSTRATION:<STUB>!!! regex and replace with <img> tag
            for (var illustration : sourceProject.getIllustrations()) {
                var illustrationStub = illustration.getStub();
                var illustrationPath = illustrationList.stream()
                        .filter(path -> path.getFileName().toString().startsWith(illustrationStub))
                        .findFirst()
                        .orElseThrow();

                chapterContent = chapterContent.replaceAll("!!!ILLUSTRATION:" + illustrationStub + "!!!",
                        "<img src=\"" + illustrationPath.toAbsolutePath() + "\" alt=\"illustration\" />");
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
}
