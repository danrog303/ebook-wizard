package com.github.danrog303.ebookwizard.domain.ebookfile.services;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.services.EbookDiskUsageCalculator;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.external.document.metadata.DocumentMetadata;
import com.github.danrog303.ebookwizard.external.document.metadata.DocumentMetadataManipulator;
import com.github.danrog303.ebookwizard.external.document.thumbnail.DocumentThumbnailManipulator;
import com.github.danrog303.ebookwizard.external.image.ImageConverter;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class EbookFileImportService {
    private final DocumentMetadataManipulator metadataManipulator;
    private final DocumentThumbnailManipulator thumbnailManipulator;
    private final FileStorageService fileStorageService;
    private final ImageConverter imageConverter;
    private final EbookDiskUsageCalculator diskUsageCalculator;

    public void applyMetadataFromDocumentToEbookFle(EbookFile ebookFile, Path documentPath) {
        DocumentMetadata metadata = metadataManipulator.getDocumentMetadata(documentPath);

        if (metadata.getName() != null) {
            ebookFile.setName(metadata.getName());
        } else {
            ebookFile.setName(documentPath.getFileName().toString());
        }

        if (metadata.getAuthor() != null) {
            ebookFile.setAuthor(metadata.getAuthor());
        } else {
            ebookFile.setAuthor("Unknown");
        }

        if (metadata.getDescription() != null) {
            ebookFile.setDescription(metadata.getDescription());
        }

        if (metadata.getTags() != null) {
            ebookFile.setTags(metadata.getTags());
        } else {
            ebookFile.setTags(new ArrayList<>());
        }

        ebookFile.setTotalSizeBytes(diskUsageCalculator.calculateEbookFileSize(ebookFile));
    }

    @SneakyThrows(IOException.class)
    public void applyCoverImageFromImageFileToEbookFile(EbookFile fileToModify, Path imagePath) {
        Objects.requireNonNull(fileToModify.getOwnerUserId());

        if (fileToModify.getCoverImageKey() != null) {
            fileStorageService.deleteFile(fileToModify.getCoverImageKey());
        }

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            Path convertedImagePath = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), "converted.jpg");
            imageConverter.convertTo(imagePath, convertedImagePath, "jpg");

            String randomKey = RandomStringUtils.randomAlphanumeric(64);
            String uploadFileKey = "ebook-files/covers/%s/%s.jpg"
                    .formatted(fileToModify.getOwnerUserId(), randomKey);

            fileStorageService.uploadFile(uploadFileKey, convertedImagePath.toFile());
            fileToModify.setCoverImageKey(uploadFileKey);

            for (EbookDownloadableResource resource : fileToModify.getDownloadableFiles()) {
                log.debug("Applying cover image for format {} to resource {}", resource.getFormat().getExtensionName(), resource.getFileKey());
                Path resFilePath = tempDir.getDirectory().resolve("ebook." + resource.getFormat().getExtensionName());
                Files.copy(fileStorageService.downloadFile(resource.getFileKey()), resFilePath);
                thumbnailManipulator.setThumbnail(resFilePath, convertedImagePath);
                fileStorageService.uploadFile(resource.getFileKey(), resFilePath.toFile());
            }
        }

        fileToModify.setTotalSizeBytes(diskUsageCalculator.calculateEbookFileSize(fileToModify));
    }

    @SneakyThrows(IOException.class)
    public void applyCoverImageFromDocumentToEbookFile(EbookFile fileToModify, Path physicalDocumentPath) {
        Objects.requireNonNull(fileToModify.getOwnerUserId());

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            Path thumbnailImagePath = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), "thumbnail.jpg");
            thumbnailManipulator.extractThumbnail(physicalDocumentPath, thumbnailImagePath);

            applyCoverImageFromImageFileToEbookFile(fileToModify, thumbnailImagePath);
        }

        fileToModify.setTotalSizeBytes(diskUsageCalculator.calculateEbookFileSize(fileToModify));
    }
}
