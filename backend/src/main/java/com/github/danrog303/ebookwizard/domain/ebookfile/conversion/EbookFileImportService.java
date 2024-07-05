package com.github.danrog303.ebookwizard.domain.ebookfile.conversion;

import com.github.danrog303.ebookwizard.domain.ebookfile.database.EbookFile;
import com.github.danrog303.ebookwizard.external.document.metadata.DocumentMetadata;
import com.github.danrog303.ebookwizard.external.document.metadata.DocumentMetadataManipulator;
import com.github.danrog303.ebookwizard.external.document.thumbnail.DocumentThumbnailManipulator;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class EbookFileImportService {
    private final DocumentMetadataManipulator metadataManipulator;
    private final DocumentThumbnailManipulator thumbnailManipulator;
    private final FileStorageService fileStorageService;

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
    }

    public void applyCoverImageFromImageFileToEbookFile(EbookFile fileToModify, Path imagePath) {
        Objects.requireNonNull(fileToModify.getOwnerUserId());

        if (fileToModify.getCoverImageKey() != null) {
            fileStorageService.deleteFile(fileToModify.getCoverImageKey());
        }

        String randomKey = RandomStringUtils.randomAlphanumeric(64);
        String uploadFileKey = "ebook-files/covers/%s/%s.jpg"
                .formatted(fileToModify.getOwnerUserId(), randomKey);

        fileStorageService.uploadFile(uploadFileKey, imagePath.toFile());
        fileToModify.setCoverImageKey(uploadFileKey);
    }

    @SneakyThrows(IOException.class)
    public void applyCoverImageFromDocumentToEbookFile(EbookFile fileToModify, Path physicalDocumentPath) {
        Objects.requireNonNull(fileToModify.getOwnerUserId());

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            Path thumbnailImagePath = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), "thumbnail.jpg");
            thumbnailManipulator.extractThumbnail(physicalDocumentPath, thumbnailImagePath);

            applyCoverImageFromImageFileToEbookFile(fileToModify, thumbnailImagePath);
        }
    }
}
