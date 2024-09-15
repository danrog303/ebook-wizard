package com.github.danrog303.ebookwizard.domain.ebookfile.services;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.models.EbookFileLock;
import com.github.danrog303.ebookwizard.domain.ebook.models.EbookFormat;
import com.github.danrog303.ebookwizard.domain.ebook.services.EbookDiskUsageCalculator;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFileRepository;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectChapter;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectIllustration;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectRepository;
import com.github.danrog303.ebookwizard.external.document.b64.Base64ImagesExtractor;
import com.github.danrog303.ebookwizard.external.document.converter.DocumentConverter;
import com.github.danrog303.ebookwizard.external.image.ImageConverter;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Uses ebook-convert binary to convert ebook files between supported formats.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EbookFileConversionService {
    private final EbookFileRepository ebookFileRepository;
    private final EbookProjectRepository ebookProjectRepository;
    private final EbookFileLockService ebookFileLockService;
    private final FileStorageService fileStorageService;
    private final DocumentConverter documentConverter;
    private final Base64ImagesExtractor base64ImagesExtractor;
    private final EbookDiskUsageCalculator diskUsageCalculator;

    @SneakyThrows(IOException.class)
    public void convertEbookFileToEbookProject(String fileId) {
        EbookFile ebookFile = ebookFileRepository.findById(fileId).orElseThrow();

        EbookProject ebookProject = new EbookProject();
        ebookProject.setId(null);
        ebookProject.setName(ebookFile.getName());
        ebookProject.setAuthor(ebookFile.getAuthor());
        ebookProject.setDescription(ebookFile.getDescription());
        ebookProject.setOwnerUserId(ebookFile.getOwnerUserId());
        ebookProject.setCreationDate(new Date());
        ebookProject.setTags(ebookFile.getTags());
        ebookProject.setIsPublic(false);
        ebookProject.setLock(new EbookFileLock(false, null));

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            if (ebookFile.getCoverImageKey() != null) {
                String randomKey = RandomStringUtils.randomAlphanumeric(64);
                String coverKey = "ebook-projects/covers/%s/%s.jpg"
                        .formatted(ebookFile.getOwnerUserId(), randomKey);

                Path coverPath = tempDir.getDirectory().resolve("cover.jpg");
                try (InputStream downloadStream = fileStorageService.downloadFile(ebookFile.getCoverImageKey())) {
                    Files.copy(downloadStream, coverPath);
                }
                fileStorageService.uploadFile(coverKey, Files.newInputStream(coverPath), Files.size(coverPath));
                ebookProject.setCoverImageKey(coverKey);
            }

            EbookFormat sourceFormat = ebookFile.getConversionSourceFormat();
            EbookDownloadableResource downloadableResource = ebookFile.getDownloadableFiles().stream()
                    .filter(resource -> resource.getFormat().equals(sourceFormat))
                    .findFirst()
                    .orElseThrow();

            Path sourceFilePath = tempDir.getDirectory().resolve("source." + sourceFormat.getExtensionName());
            Files.copy(fileStorageService.downloadFile(downloadableResource.getFileKey()), sourceFilePath);

            Path htmlFilePath;
            if (sourceFormat == EbookFormat.HTML) {
                htmlFilePath = sourceFilePath;
            } else {
                htmlFilePath = tempDir.getDirectory().resolve("source.html");
                documentConverter.convertDocument(sourceFilePath, htmlFilePath);
            }

            ebookProject.setIllustrations(extractEbookProjectImages(htmlFilePath));

            EbookProjectChapter chapter = new EbookProjectChapter();
            chapter.setId(RandomStringUtils.randomAlphanumeric(64));
            chapter.setName("Chapter 1");
            chapter.setContentHtml(Files.readString(htmlFilePath));
            chapter.setCreationDate(new Date());
            chapter.setLastModifiedDate(new Date());
            ebookProject.getChapters().add(chapter);
        }

        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));
        ebookProjectRepository.save(ebookProject);
        ebookFileLockService.unlockEbookFileForEditing(fileId);
    }

    @SneakyThrows
    public void addNewFileFormatToEbookFile(String fileId, String targetFormat) {
        EbookFormat targetEbookFormat = EbookFormat.fromExtension(targetFormat);
        if (targetEbookFormat == null) {
            throw new IllegalArgumentException("Invalid target format: " + targetFormat);
        }

        EbookFile ebookFile = ebookFileRepository.findById(fileId).orElseThrow();
        boolean hasExactFormat = ebookFile.getDownloadableFiles()
                .stream()
                .anyMatch(downloadableResource -> downloadableResource.getFormat().equals(targetEbookFormat));

        // No need to convert if the exact format is already present
        if (hasExactFormat) {
            ebookFileLockService.unlockEbookFileForEditing(fileId);
            return;
        }

        EbookDownloadableResource sourceResource = ebookFile.getDownloadableFiles().stream()
                .filter(downloadableResource -> downloadableResource.getFormat().equals(ebookFile.getConversionSourceFormat()))
                .findFirst()
                .orElseThrow();

        EbookDownloadableResource newResource;
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            String tempDirPath = tempDir.getDirectory().toAbsolutePath().toString();
            Path sourceFilePath = Path.of(tempDirPath, "source-file." + sourceResource.getFormat().getExtensionName());
            Path targetFilePath = Path.of(tempDirPath, "target-file." + targetEbookFormat.getExtensionName());
            try (InputStream downloadStream = fileStorageService.downloadFile(sourceResource.getFileKey())) {
                Files.copy(downloadStream, sourceFilePath);
            }
            documentConverter.convertDocument(sourceFilePath, targetFilePath);
            String randomKey = RandomStringUtils.randomAlphanumeric(64);
            String uploadFileKey = "ebook-files/downloadables/%s/%s.%s"
                    .formatted(ebookFile.getOwnerUserId(), randomKey, targetEbookFormat.getExtensionName());
            fileStorageService.uploadFile(uploadFileKey, Files.newInputStream(targetFilePath), Files.size(targetFilePath));
            newResource = new EbookDownloadableResource(randomKey, targetEbookFormat, new Date(), uploadFileKey);
        }

        ebookFile.getDownloadableFiles().add(newResource);
        ebookFile.setTotalSizeBytes(diskUsageCalculator.calculateEbookFileSize(ebookFile));
        ebookFileRepository.save(ebookFile);
        ebookFileLockService.unlockEbookFileForEditing(fileId);
    }

    @SneakyThrows(IOException.class)
    private List<EbookProjectIllustration> extractEbookProjectImages(Path htmlInputPath) {
        List<EbookProjectIllustration> images = new ArrayList<>();

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            var extractedImages = base64ImagesExtractor.extractBase64Images(htmlInputPath, tempDir.getDirectory());
            log.debug("Extracted {} images from the HTML file", extractedImages.size());

            extractedImages.forEach(extractedImage -> {
                String imageKey = "ebook-projects/illustrations/%s/%s.jpg"
                        .formatted(extractedImage.getRandomTag(), extractedImage.getRandomTag());

                try {
                    fileStorageService.uploadFile(
                            imageKey,
                            Files.newInputStream(extractedImage.getPath()),
                            Files.size(extractedImage.getPath())
                    );
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }

                EbookProjectIllustration image = new EbookProjectIllustration();
                image.setFileKey(imageKey);
                image.setStub(extractedImage.getRandomTag());
                images.add(image);
            });
        }

        return images;
    }
}
