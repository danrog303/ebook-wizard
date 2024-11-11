package com.github.danrog303.ebookwizard.domain.ebookfile.services;

import com.github.danrog303.ebookwizard.domain.ebook.models.*;
import com.github.danrog303.ebookwizard.domain.ebook.services.EbookDiskUsageCalculator;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFileRepository;
import com.github.danrog303.ebookwizard.domain.errorhandling.exceptions.FileStorageQuotaExceededException;
import com.github.danrog303.ebookwizard.domain.taskqueue.conversion.ConversionQueueService;
import com.github.danrog303.ebookwizard.domain.taskqueue.conversion.ConversionQueueTaskPayload;
import com.github.danrog303.ebookwizard.domain.taskqueue.conversion.ConversionQueueTaskType;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskPayload;
import com.github.danrog303.ebookwizard.domain.taskqueue.email.EmailQueueService;
import com.github.danrog303.ebookwizard.domain.taskqueue.email.EmailQueueTaskPayload;
import com.github.danrog303.ebookwizard.external.auth.AuthorizationProvider;
import com.github.danrog303.ebookwizard.external.mime.MimeTypeDetector;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import com.github.danrog303.ebookwizard.external.validator.ValidatorService;
import com.github.danrog303.ebookwizard.util.string.StringNormalizer;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.access.AuthorizationServiceException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EbookFileManipulationService {
    private final AuthorizationProvider authorizationProvider;
    private final MimeTypeDetector mimeTypeDetector;
    private final FileStorageService fileStorageService;
    private final EbookFileRepository ebookFileRepository;
    private final ConversionQueueService conversionQueueService;
    private final EmailQueueService emailQueueService;
    private final EbookFileLockService ebookFileLockService;
    private final EbookFileImportService ebookFileImportService;
    private final EbookFileUpdateService ebookFileUpdateService;
    private final EbookDiskUsageCalculator diskUsageCalculator;
    private final ValidatorService validatorService;

    public int MAX_EBOOK_FILE_COVER_SIZE = 5 * 1024 * 1024;

    public QueueTask<QueueTaskPayload> enqueueAddNewFileTypeToEbookFile(String ebookFileId, String targetFormat) {
        EbookFile ebookFile = requireEbookFilePermission(ebookFileId, EbookAccessType.READ_WRITE);
        EbookFormat sourceFormat = ebookFile.getConversionSourceFormat();
        String sourceFormatKey = ebookFile.getDownloadableFiles().stream()
                .filter(file -> file.getFormat().equals(sourceFormat))
                .findFirst().orElseThrow().getFileKey();
        diskUsageCalculator.requireDiskSpace(this.fileStorageService.getFileSize(sourceFormatKey));

        this.ebookFileLockService.lockEbookFileForEditing(ebookFileId);
        ConversionQueueTaskPayload conversionQueueTaskPayload = new ConversionQueueTaskPayload(
                ebookFileId,
                ConversionQueueTaskType.FILE_TO_FILE,
                targetFormat);

        return conversionQueueService.enqueueConversionTask(conversionQueueTaskPayload);
    }

    public QueueTask<QueueTaskPayload> enqueueConvertEbookFileToEbookProject(String ebookFileId) {
        EbookFile ebookFile = requireEbookFilePermission(ebookFileId, EbookAccessType.READ_WRITE);
        diskUsageCalculator.requireDiskSpace(ebookFile.getTotalSizeBytes());

        this.ebookFileLockService.lockEbookFileForEditing(ebookFileId);
        ConversionQueueTaskPayload conversionQueueTaskPayload = new ConversionQueueTaskPayload(
                ebookFileId,
                ConversionQueueTaskType.FILE_TO_PROJECT,
                "");

        return conversionQueueService.enqueueConversionTask(conversionQueueTaskPayload);
    }

    public QueueTask<QueueTaskPayload> enqueueSendEbookFileToEmail(String targetEmail, String ebookFileId, String targetFormat) {
        EbookFile ebookFile = requireEbookFilePermission(ebookFileId, EbookAccessType.READ_ONLY);

        EbookFormat format = EbookFormat.fromExtension(targetFormat.toLowerCase());
        if (format == null) {
            throw new IllegalArgumentException("Unsupported file format: %s".formatted(targetFormat));
        }

        EbookDownloadableResource downloadableFile = ebookFile
                .getDownloadableFiles()
                .stream()
                .filter(file -> file.getFormat().equals(format))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("EbookFile does not have the requested format"));

        var emailAttachment = new EmailQueueTaskPayload.EmailQueueTaskPayloadAttachment(
                "ebook.%s".formatted(format.getExtensionName()),
                downloadableFile.getFileKey()
        );

        var emailPayload = new EmailQueueTaskPayload(
                targetEmail,
                "Your ebook from ebook-wizard",
                 "Here is your requested ebook file",
                List.of(emailAttachment)
        );

        return emailQueueService.enqueueEmail(emailPayload);
    }

    public List<EbookFile> listEbookFilesOfAuthenticatedUser() {
        authorizationProvider.requireAuthentication();
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        return ebookFileRepository.findAllByOwnerUserId(currentUserId);
    }

    @SneakyThrows(IOException.class)
    public EbookFile importEbookFile(MultipartFile file) {
        authorizationProvider.requireAuthentication();
        diskUsageCalculator.requireDiskSpace(file.getSize());

        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        String fileName = Objects.requireNonNull(file.getOriginalFilename());

        String mimeType = this.mimeTypeDetector.detectMimeType(file.getInputStream());
        EbookFormat format = EbookFormat.fromMimeType(mimeType);
        if (format == null) {
            throw new IllegalArgumentException("Unsupported file format: %s".formatted(mimeType));
        }

        // Workaround for AZW3
        // This is required, because the mimetype of AZW3 files is the same as MOBI files
        if (format.getExtensionName().equals("mobi") && fileName.endsWith("azw3")) {
            format = EbookFormat.AZW3;
        }

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            Path tempFile = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), fileName);
            Files.copy(file.getInputStream(), tempFile);

            EbookFile ebook = new EbookFile();
            ebookFileImportService.applyMetadataFromDocumentToEbookFle(ebook, tempFile);

            ebook.setId(null);
            ebook.setOwnerUserId(currentUserId);
            ebook.setCoverImageKey(null);
            ebook.setCreationDate(new Date());
            ebook.setEditLock(new EbookFileLock(false, null));
            ebook.setConversionSourceFormat(format);
            ebook.setContainerName(null);
            ebook.setPublic(false);
            ebookFileImportService.applyCoverImageFromDocumentToEbookFile(ebook, tempFile);

            String randomKey = RandomStringUtils.randomAlphanumeric(64);
            String uploadFileKey = "ebook-files/downloadables/%s/%s.%s"
                    .formatted(currentUserId, randomKey, format.getExtensionName());

            this.fileStorageService.uploadFile(uploadFileKey, tempFile.toFile());

            EbookDownloadableResource downloadableFile = new EbookDownloadableResource();
            downloadableFile.setFormat(format);
            downloadableFile.setCreationDate(new Date());
            downloadableFile.setFileKey(uploadFileKey);
            downloadableFile.setStub(randomKey);

            ebook.setDownloadableFiles(List.of(downloadableFile));
            ebook.setTotalSizeBytes(diskUsageCalculator.calculateEbookFileSize(ebook));

            return ebookFileRepository.save(ebook);
        }
    }

    public String getDownloadUrlForEbookFile(String ebookFileId, String ebookFileFormat, ContentDispositionType dispositionType) {
        EbookFile ebookFile = requireEbookFilePermission(ebookFileId, EbookAccessType.READ_ONLY);

        EbookFormat format = EbookFormat.fromExtension(ebookFileFormat);
        EbookDownloadableResource downloadableFile = ebookFile
                .getDownloadableFiles()
                .stream().filter(file -> file.getFormat().equals(format))
                .findFirst().orElseThrow();

        String targetName = "%s.%s".formatted(StringNormalizer.normalize(ebookFile.getName()), format.getExtensionName().toLowerCase());
        if (targetName.startsWith(".")) {
            targetName = "ebook" + targetName;
        }

        if (dispositionType == ContentDispositionType.INLINE) {
            return this.fileStorageService.getInlineDownloadUrl(downloadableFile.getFileKey());
        } else {
            return this.fileStorageService.getDownloadUrl(downloadableFile.getFileKey(), targetName);
        }
    }

    public void deleteEbookFile(String ebookFileId) {
        EbookFile ebookFile = requireEbookFilePermission(ebookFileId, EbookAccessType.READ_WRITE);

        for (EbookDownloadableResource downloadableFile : ebookFile.getDownloadableFiles()) {
            this.fileStorageService.deleteFile(downloadableFile.getFileKey());
        }

        if (ebookFile.getCoverImageKey() != null) {
            this.fileStorageService.deleteFile(ebookFile.getCoverImageKey());
        }

        ebookFileRepository.deleteById(ebookFileId);
    }

    public EbookFile updateEbookFile(String ebookFileId, EbookFile newEbookFile) {
        EbookFile ebookFile = requireEbookFilePermission(ebookFileId, EbookAccessType.READ_WRITE);

        ebookFile.setName(newEbookFile.getName());
        ebookFile.setDescription(newEbookFile.getDescription());
        ebookFile.setAuthor(newEbookFile.getAuthor());
        ebookFile.setTags(newEbookFile.getTags());
        ebookFile.setFavorite(newEbookFile.isFavorite());
        ebookFile.setPublic(newEbookFile.isPublic());

        ebookFile.setContainerName(newEbookFile.getContainerName());
        if (ebookFile.getContainerName() != null && ebookFile.getContainerName().isBlank()) {
            ebookFile.setContainerName(null);
        }

        var hasRequestedFormat = ebookFile
                .getDownloadableFiles()
                .stream()
                .anyMatch(file -> file.getFormat().equals(newEbookFile.getConversionSourceFormat()));

        if (hasRequestedFormat) {
            ebookFile.setConversionSourceFormat(newEbookFile.getConversionSourceFormat());
        }

        ebookFile.setTotalSizeBytes(diskUsageCalculator.calculateEbookFileSize(ebookFile));

        if (! validatorService.isValid(ebookFile)) {
            throw new IllegalArgumentException("Invalid ebook file data (bean validation failed)");
        }

        ebookFileUpdateService.updateEbookFileMetadata(ebookFile);
        return ebookFileRepository.save(ebookFile);
    }

    public EbookFile getEbookFile(String ebookFileId) {
        return requireEbookFilePermission(ebookFileId, EbookAccessType.READ_ONLY);
    }

    public void deleteEbookFileFormat(String ebookFileId, String ebookFileFormat) {
        EbookFile ebookFile = requireEbookFilePermission(ebookFileId, EbookAccessType.READ_WRITE);

        if (ebookFile.getConversionSourceFormat() == EbookFormat.fromExtension(ebookFileFormat)) {
            throw new IllegalArgumentException("Cannot delete the source format of the ebook file");
        }

        if (ebookFile.getDownloadableFiles().size() == 1) {
            throw new IllegalArgumentException("Cannot delete the last downloadable file of the ebook file");
        }

        EbookFormat format = EbookFormat.fromExtension(ebookFileFormat);
        EbookDownloadableResource downloadableFile = ebookFile
                .getDownloadableFiles()
                .stream().filter(file -> file.getFormat().equals(format))
                .findFirst().orElseThrow();

        this.fileStorageService.deleteFile(downloadableFile.getFileKey());
        ebookFile.getDownloadableFiles().remove(downloadableFile);
        ebookFile.setTotalSizeBytes(diskUsageCalculator.calculateEbookFileSize(ebookFile));
        ebookFileRepository.save(ebookFile);
    }

    @SneakyThrows({IOException.class})
    public EbookFile updateEbookFileCoverImage(String ebookFileId, MultipartFile coverImageFile) {
        EbookFile ebookFile = requireEbookFilePermission(ebookFileId, EbookAccessType.READ_WRITE);
        diskUsageCalculator.requireDiskSpace(coverImageFile.getSize());

        if (coverImageFile.getSize() > MAX_EBOOK_FILE_COVER_SIZE) {
            throw new FileStorageQuotaExceededException("Cover image file is too large");
        }

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            Path tempFile = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), coverImageFile.getOriginalFilename());
            Files.copy(coverImageFile.getInputStream(), tempFile);

            String coverMimeType = mimeTypeDetector.detectMimeType(tempFile.toFile());
            if (!Objects.equals(coverMimeType, "image/jpeg") && !Objects.equals(coverMimeType, "image/png")) {
                throw new IllegalArgumentException("Invalid cover image file type (only png and jpeg are supported)");
            }

            ebookFileImportService.applyCoverImageFromImageFileToEbookFile(ebookFile, tempFile);
        }

        ebookFile.setTotalSizeBytes(diskUsageCalculator.calculateEbookFileSize(ebookFile));
        ebookFileRepository.save(ebookFile);
        return ebookFile;
    }

    public void deleteEbookFileCoverImage(String ebookFileId) {
        EbookFile ebookFile = requireEbookFilePermission(ebookFileId, EbookAccessType.READ_WRITE);

        if (ebookFile.getCoverImageKey() != null) {
            this.fileStorageService.deleteFile(ebookFile.getCoverImageKey());
            ebookFile.setCoverImageKey(null);
            ebookFile.setTotalSizeBytes(diskUsageCalculator.calculateEbookFileSize(ebookFile));
            ebookFileRepository.save(ebookFile);
        }
    }

    public String getCoverImageUrl(String ebookFileId) {
        EbookFile ebookFile = requireEbookFilePermission(ebookFileId, EbookAccessType.READ_ONLY);
        return this.fileStorageService.getDownloadUrl(ebookFile.getCoverImageKey());
    }

    private EbookFile requireEbookFilePermission(String ebookFileId, EbookAccessType accessType) {
        EbookFile ef = ebookFileRepository.findById(ebookFileId).orElseThrow();

        if (accessType.equals(EbookAccessType.READ_ONLY) && ef.isPublic()) {
            return ef;
        }

        if (accessType.equals(EbookAccessType.READ_WRITE) && ef.getEditLock().getIsLocked()) {
            throw new IllegalStateException("Ebook is currently locked for editing (background task is running)");
        }

        if (!authorizationProvider.getAuthenticatedUserId().equals(ef.getOwnerUserId())) {
            throw new AuthorizationServiceException("Not authorized");
        }

        return ef;
    }

    public List<EbookFolder> getExistingFolders() {
        authorizationProvider.requireAuthentication();
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        List<EbookFile> ebookFiles = ebookFileRepository.findAllByOwnerUserId(currentUserId);
        Map<String, Long> folderSizes = new HashMap<>();

        for (EbookFile ebookFile : ebookFiles) {
            String containerName = ebookFile.getContainerName();
            if (containerName == null) {
                continue;
            }

            long currentSize = folderSizes.getOrDefault(containerName, 0L);
            folderSizes.put(containerName, currentSize + 1);
        }

        return folderSizes.entrySet().stream()
                .map(entry -> new EbookFolder(entry.getKey(), entry.getValue()))
                .toList();
    }
}
