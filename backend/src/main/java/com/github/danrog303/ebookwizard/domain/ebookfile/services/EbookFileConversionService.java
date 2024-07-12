package com.github.danrog303.ebookwizard.domain.ebookfile.services;

import com.github.danrog303.ebookwizard.domain.ebook.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFileLock;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFileRepository;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectChapter;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectRepository;
import com.github.danrog303.ebookwizard.external.document.converter.DocumentConverter;
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
import java.util.Date;

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
            EbookFormat sourceFormat = ebookFile.getConversionSourceFormat();
            EbookDownloadableResource downloadableResource = ebookFile.getDownloadableFiles().stream()
                    .filter(resource -> resource.getFormat().equals(sourceFormat))
                    .findFirst()
                    .orElseThrow();

            Path sourceFilePath = tempDir.getDirectory().resolve("source." + sourceFormat.getExtensionName());
            Files.copy(fileStorageService.downloadFile(downloadableResource.getFileKey()), sourceFilePath);

            Path txtFilePath;
            if (sourceFormat == EbookFormat.TXT) {
                txtFilePath = sourceFilePath;
            } else {
                txtFilePath = tempDir.getDirectory().resolve("source.txt");
                documentConverter.convertDocument(sourceFilePath, txtFilePath);
            }

            EbookProjectChapter chapter = new EbookProjectChapter();
            chapter.setId(RandomStringUtils.randomAlphanumeric(64));
            chapter.setName("Chapter 1");
            chapter.setContentHtml(Files.readString(txtFilePath));
            chapter.setCreationDate(new Date());
            chapter.setLastModifiedDate(new Date());
            ebookProject.getChapters().add(chapter);
        }

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
        ebookFileRepository.save(ebookFile);
        ebookFileLockService.unlockEbookFileForEditing(fileId);
    }
}
