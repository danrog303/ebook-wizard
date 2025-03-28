package com.github.danrog303.ebookwizard.domain.ebookfile.services;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.models.EbookFormat;
import com.github.danrog303.ebookwizard.domain.ebook.services.EbookDiskUsageService;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.external.document.metadata.DocumentMetadata;
import com.github.danrog303.ebookwizard.external.document.metadata.DocumentMetadataManipulator;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * When there is a need to update an EbookFile instance metadata,
 * this service downloads all file revisions from storage service and applies the changes.
 * This shall be done as a queue task, as it may take a long time to complete.
 * During this update process, the EbookFile instance is locked for editing.
 */
@Service
@RequiredArgsConstructor
public class EbookFileUpdateService {
    private final FileStorageService fileStorageService;
    private final DocumentMetadataManipulator metadataManipulator;
    private final EbookDiskUsageService diskUsageCalculator;

    @SneakyThrows(IOException.class)
    public void updateEbookFileMetadata(EbookFile ebook) {
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            for (EbookDownloadableResource resource : ebook.getDownloadableFiles()) {
                EbookFormat format = resource.getFormat();
                String key = resource.getFileKey();
                Path tempFile = Path.of(
                    tempDir.getDirectory().toAbsolutePath().toString(),
                    "ebook." + format.getExtensionName()
                );

                DocumentMetadata metadata = convertEbookFileToDocumentMetadata(ebook);

                Files.copy(fileStorageService.downloadFile(key), tempFile);
                metadataManipulator.setDocumentMetadata(tempFile, metadata);
                fileStorageService.uploadFile(key, tempFile.toFile());
            }
        }

        ebook.setTotalSizeBytes(diskUsageCalculator.calculateEbookFileSize(ebook));
    }

    private DocumentMetadata convertEbookFileToDocumentMetadata(EbookFile ebookFile) {
        DocumentMetadata metadata = new DocumentMetadata();
        metadata.setName(ebookFile.getName());
        metadata.setAuthor(ebookFile.getAuthor());
        metadata.setDescription(ebookFile.getDescription());
        metadata.setTags(ebookFile.getTags());
        return metadata;
    }
}
