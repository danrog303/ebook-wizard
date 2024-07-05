package com.github.danrog303.ebookwizard.domain.ebookfile.api;

import com.github.danrog303.ebookwizard.domain.ebook.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFileLock;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import com.github.danrog303.ebookwizard.domain.ebookfile.conversion.EbookFileImportService;
import com.github.danrog303.ebookwizard.domain.ebookfile.conversion.EbookFileLockService;
import com.github.danrog303.ebookwizard.domain.ebookfile.conversion.EbookFileUpdateService;
import com.github.danrog303.ebookwizard.domain.ebookfile.database.EbookFile;
import com.github.danrog303.ebookwizard.domain.ebookfile.database.EbookFileRepository;
import com.github.danrog303.ebookwizard.domain.taskqueue.conversion.ConversionQueueService;
import com.github.danrog303.ebookwizard.domain.taskqueue.conversion.ConversionQueueTaskPayload;
import com.github.danrog303.ebookwizard.domain.taskqueue.conversion.ConversionQueueTaskType;
import com.github.danrog303.ebookwizard.domain.taskqueue.database.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.database.QueueTaskPayload;
import com.github.danrog303.ebookwizard.domain.taskqueue.email.EmailQueueService;
import com.github.danrog303.ebookwizard.domain.taskqueue.email.EmailQueueTaskPayload;
import com.github.danrog303.ebookwizard.external.auth.AuthorizationProvider;
import com.github.danrog303.ebookwizard.external.mime.MimeTypeDetector;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
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
import java.util.Date;
import java.util.List;
import java.util.Objects;

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

    public QueueTask<QueueTaskPayload> enqueueAddNewFileTypeToEbookFile(String ebookFileId, String targetFormat) {
        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();
        if (!ebookFile.getOwnerUserId().equals(authorizationProvider.getAuthenticatedUserId())) {
            throw new AuthorizationServiceException("User is not the owner of the ebook file");
        }

        this.ebookFileLockService.lockEbookFileForEditing(ebookFileId);
        ConversionQueueTaskPayload conversionQueueTaskPayload = new ConversionQueueTaskPayload(
                ebookFileId,
                ConversionQueueTaskType.FILE_TO_FILE,
                targetFormat);

        return conversionQueueService.enqueueConversionTask(conversionQueueTaskPayload);
    }

    public QueueTask<QueueTaskPayload> enqueueConvertEbookFileToEbookProject(String ebookFileId) {
        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();
        if (!ebookFile.getOwnerUserId().equals(authorizationProvider.getAuthenticatedUserId())) {
            throw new AuthorizationServiceException("User is not the owner of the ebook file");
        }

        this.ebookFileLockService.lockEbookFileForEditing(ebookFileId);
        ConversionQueueTaskPayload conversionQueueTaskPayload = new ConversionQueueTaskPayload(
                ebookFileId,
                ConversionQueueTaskType.FILE_TO_PROJECT,
                "");

        return conversionQueueService.enqueueConversionTask(conversionQueueTaskPayload);
    }

    public QueueTask<QueueTaskPayload> enqueueSendEbookFileToEmail(String targetEmail, String ebookFileId, String targetFormat) {
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();

        if (!ebookFile.getOwnerUserId().equals(currentUserId) && !ebookFile.isPublic())  {
            throw new AuthorizationServiceException("User is not the owner of the ebook file");
        }

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
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        return ebookFileRepository.findAllByOwnerUserId(currentUserId);
    }

    @SneakyThrows(IOException.class)
    public EbookFile importEbookFile(MultipartFile file) {
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IllegalArgumentException("File name is null");
        }

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
            ebookFileImportService.applyCoverImageFromDocumentToEbookFile(ebook, tempFile);

            if (ebook.getContainerName() != null && ebook.getContainerName().isBlank()) {
                ebook.setContainerName(null);
            }

            String randomKey = RandomStringUtils.randomAlphanumeric(64);
            String uploadFileKey = "ebook-files/downloadables/%s/%s.%s"
                    .formatted(currentUserId, randomKey, format.getExtensionName());

            this.fileStorageService.uploadFile(uploadFileKey, tempFile.toFile());

            EbookDownloadableResource downloadableFile = new EbookDownloadableResource();
            downloadableFile.setFormat(format);
            downloadableFile.setCreationDate(new Date());
            downloadableFile.setFileKey(uploadFileKey);

            ebook.setDownloadableFiles(List.of(downloadableFile));
            return ebookFileRepository.save(ebook);
        }
    }

    public String getDownloadUrlForEbookFile(String ebookFileId, String ebookFileFormat) {
        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();

        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        if (!ebookFile.isPublic() && !ebookFile.getOwnerUserId().equals(currentUserId)) {
            throw new AuthorizationServiceException("You are not authenticated to access this resource");
        }

        EbookFormat format = EbookFormat.fromExtension(ebookFileFormat);
        EbookDownloadableResource downloadableFile = ebookFile
                .getDownloadableFiles()
                .stream().filter(file -> file.getFormat().equals(format))
                .findFirst().orElseThrow();

        return this.fileStorageService.getDownloadUrl(downloadableFile.getFileKey());
    }

    public void deleteEbookFile(String ebookFileId) {
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();

        if (ebookFile.getEditLock().getIsLocked()) {
            throw new IllegalStateException("Ebook file is currently locked for editing (background task is running)");
        }

        if (!ebookFile.getOwnerUserId().equals(currentUserId)) {
            throw new AuthorizationServiceException("User is not the owner of the ebook file");
        }

        for (EbookDownloadableResource downloadableFile : ebookFile.getDownloadableFiles()) {
            this.fileStorageService.deleteFile(downloadableFile.getFileKey());
        }

        if (ebookFile.getCoverImageKey() != null) {
            this.fileStorageService.deleteFile(ebookFile.getCoverImageKey());
        }

        ebookFileRepository.deleteById(ebookFileId);
    }

    public EbookFile updateEbookFile(String ebookFileId, EbookFile newEbookFile) {
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();

        if (!ebookFile.getOwnerUserId().equals(currentUserId)) {
            throw new AuthorizationServiceException("User is not the owner of the ebook file");
        }

        if (ebookFile.getEditLock().getIsLocked()) {
            throw new IllegalStateException("Ebook file is currently locked for editing (background task is running)");
        }

        ebookFile.setName(newEbookFile.getName());
        ebookFile.setDescription(newEbookFile.getDescription());
        ebookFile.setAuthor(newEbookFile.getAuthor());
        ebookFile.setTags(newEbookFile.getTags());
        ebookFile.setContainerName(newEbookFile.getContainerName());
        ebookFile.setFavorite(newEbookFile.isFavorite());

        var hasRequestedFormat = ebookFile
                .getDownloadableFiles()
                .stream()
                .anyMatch(file -> file.getFormat().equals(newEbookFile.getConversionSourceFormat()));

        if (hasRequestedFormat) {
            ebookFile.setConversionSourceFormat(newEbookFile.getConversionSourceFormat());
        }

        ebookFileUpdateService.updateEbookFileMetadata(ebookFile);
        return ebookFileRepository.save(ebookFile);
    }

    public EbookFile getEbookFile(String ebookFileId) {
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();

        if (!ebookFile.isPublic() && !ebookFile.getOwnerUserId().equals(currentUserId)) {
            throw new AuthorizationServiceException("You are not authenticated to access this resource");
        }

        return ebookFile;
    }

    public void deleteEbookFileFormat(String ebookFileId, String ebookFileFormat) {
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();

        if (!ebookFile.getOwnerUserId().equals(currentUserId)) {
            throw new AuthorizationServiceException("User is not the owner of the ebook file");
        }

        if (ebookFile.getConversionSourceFormat() == EbookFormat.fromExtension(ebookFileFormat)) {
            throw new IllegalArgumentException("Cannot delete the source format of the ebook file");
        }

        if (ebookFile.getDownloadableFiles().size() == 1) {
            throw new IllegalArgumentException("Cannot delete the last downloadable file of the ebook file");
        }

        if (ebookFile.getEditLock().getIsLocked()) {
            throw new IllegalStateException("Ebook file is currently locked for editing (background task is running)");
        }

        EbookFormat format = EbookFormat.fromExtension(ebookFileFormat);
        EbookDownloadableResource downloadableFile = ebookFile
                .getDownloadableFiles()
                .stream().filter(file -> file.getFormat().equals(format))
                .findFirst().orElseThrow();

        this.fileStorageService.deleteFile(downloadableFile.getFileKey());
        ebookFile.getDownloadableFiles().remove(downloadableFile);
        ebookFileRepository.save(ebookFile);
    }

    @SneakyThrows({IOException.class})
    public EbookFile updateEbookFileCoverImage(String ebookFileId, MultipartFile coverImageFile) {
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        EbookFile ebookFile = ebookFileRepository.findById(ebookFileId).orElseThrow();

        if (!ebookFile.getOwnerUserId().equals(currentUserId)) {
            throw new AuthorizationServiceException("User is not the owner of the ebook file");
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

        ebookFileRepository.save(ebookFile);
        return ebookFile;
    }
}
