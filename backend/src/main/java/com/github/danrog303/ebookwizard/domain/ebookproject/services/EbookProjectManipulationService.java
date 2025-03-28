package com.github.danrog303.ebookwizard.domain.ebookproject.services;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookAccessType;
import com.github.danrog303.ebookwizard.domain.ebook.models.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.models.EbookEditLock;
import com.github.danrog303.ebookwizard.domain.ebook.models.EbookFormat;
import com.github.danrog303.ebookwizard.domain.ebook.services.EbookDiskUsageService;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectChapter;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectIllustration;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectRepository;
import com.github.danrog303.ebookwizard.domain.errorhandling.exceptions.FileStorageQuotaExceededException;
import com.github.danrog303.ebookwizard.domain.taskqueue.conversion.ConversionQueueService;
import com.github.danrog303.ebookwizard.domain.taskqueue.conversion.ConversionQueueTaskPayload;
import com.github.danrog303.ebookwizard.domain.taskqueue.conversion.ConversionQueueTaskType;
import com.github.danrog303.ebookwizard.domain.taskqueue.email.EmailQueueService;
import com.github.danrog303.ebookwizard.domain.taskqueue.email.EmailQueueTaskPayload;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskPayload;
import com.github.danrog303.ebookwizard.external.auth.AuthorizationProvider;
import com.github.danrog303.ebookwizard.external.image.ImageConverter;
import com.github.danrog303.ebookwizard.external.mime.MimeTypeDetector;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import com.github.danrog303.ebookwizard.external.validator.ValidatorService;
import com.github.danrog303.ebookwizard.util.string.StringNormalizer;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
 import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EbookProjectManipulationService {
    private final EbookProjectRepository ebookProjectRepository;
    private final EbookProjectConversionService ebookProjectConversionService;
    private final EbookProjectPermissionService permissionService;
    private final AuthorizationProvider authorizationProvider;
    private final FileStorageService fileStorageService;
    private final MimeTypeDetector mimeTypeDetector;
    private final ImageConverter imageConverter;
    private final ConversionQueueService conversionQueueService;
    private final EmailQueueService emailQueueService;
    private final EbookDiskUsageService diskUsageCalculator;
    private final ValidatorService validatorService;

    public static final int MAX_EBOOK_PROJECT_COVER_SIZE = 5 * 1024 * 1024;
    public static final int MAX_EBOOK_PROJECT_ILLUSTRATION_SIZE = 5 * 1024 * 1024;

    public EbookProject createEmptyEbookProject(EbookProject ebookProject) {
        authorizationProvider.requireAuthentication();

        EbookProjectChapter chapter = new EbookProjectChapter();
        chapter.setId(RandomStringUtils.randomAlphanumeric(64));
        chapter.setName("Chapter 1");
        chapter.setContentHtml("<p>Chapter content</p>");
        chapter.setCreationDate(new Date());
        chapter.setLastModifiedDate(new Date());

        ebookProject.setId(null);
        ebookProject.setCreationDate(new Date());
        ebookProject.setChapters(List.of(chapter));
        ebookProject.setCoverImageKey(null);
        ebookProject.setLock(new EbookEditLock(false, null));
        ebookProject.setIllustrations(new ArrayList<>());
        ebookProject.setDownloadableFiles(new ArrayList<>());
        ebookProject.setOwnerUserId(authorizationProvider.getAuthenticatedUserId());
        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));

        if (ebookProject.getIsPublic() == null) {
            ebookProject.setIsPublic(false);
        }

        // Validate by using Hibernate Validator
        if (this.validatorService.isValid(ebookProject)) {
            return ebookProjectRepository.save(ebookProject);
        } else {
            throw new IllegalArgumentException("Invalid ebook project data (bean validation failed)");
        }
    }

    @SneakyThrows(IOException.class)
    public EbookProjectIllustration uploadIllustrationImage(String ebookProjectId, MultipartFile illustrationImageFile) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        this.diskUsageCalculator.requireDiskSpace(illustrationImageFile.getSize());

        if (illustrationImageFile.getSize() > MAX_EBOOK_PROJECT_ILLUSTRATION_SIZE) {
            throw new FileStorageQuotaExceededException("Illustration image file is too large");
        }

        String currentUserId = authorizationProvider.getAuthenticatedUserId();

        String randomKey = RandomStringUtils.randomAlphanumeric(64);
        String uploadFileKey = "ebook-projects/illustrations/%s/%s.jpg"
                .formatted(currentUserId, randomKey);

        fileStorageService.uploadFile(
                uploadFileKey,
                illustrationImageFile.getInputStream(),
                illustrationImageFile.getSize()
        );

        EbookProjectIllustration illustration = new EbookProjectIllustration(randomKey, uploadFileKey);
        ebookProject.getIllustrations().add(illustration);
        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));
        ebookProjectRepository.save(ebookProject);

        return illustration;
    }

    @SneakyThrows(IOException.class)
    public EbookProject updateCoverImage(String ebookProjectId, MultipartFile coverImageFile) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        String currentUserId = authorizationProvider.getAuthenticatedUserId();
        this.diskUsageCalculator.requireDiskSpace(coverImageFile.getSize());

        if (coverImageFile.getSize() > MAX_EBOOK_PROJECT_COVER_SIZE) {
            throw new FileStorageQuotaExceededException("Cover image file is too large");
        }

        if (ebookProject.getCoverImageKey() != null) {
            fileStorageService.deleteFile(ebookProject.getCoverImageKey());
        }

        try (TemporaryDirectory tempDirectory = new TemporaryDirectory()) {
            String userFile = coverImageFile.getOriginalFilename();
            Path tempFile = tempDirectory.getDirectory().resolve(Objects.requireNonNull(userFile));
            Files.copy(coverImageFile.getInputStream(), tempFile);

            String coverMimeType = mimeTypeDetector.detectMimeType(tempFile.toFile());
            if (!Objects.equals(coverMimeType, "image/jpeg") && !Objects.equals(coverMimeType, "image/png")) {
                throw new IllegalArgumentException("Invalid cover image file type (only png and jpeg are supported)");
            }

            Path convertedFile = Path.of(tempDirectory.getDirectory().toAbsolutePath().toString(), "converted.jpg");
            imageConverter.convertTo(tempFile, convertedFile, "jpg");

            String randomKey = RandomStringUtils.randomAlphanumeric(64);
            String uploadFileKey = "ebook-projects/covers/%s/%s.jpg"
                    .formatted(currentUserId, randomKey);

            this.fileStorageService.uploadFile(uploadFileKey, convertedFile.toFile());
            ebookProject.setCoverImageKey(uploadFileKey);
            ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));

            return ebookProjectRepository.save(ebookProject);
        }
    }

    public void deleteIllustrationImage(String ebookProjectId, String illustrationHash) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);

        ebookProject.getIllustrations()
                .stream()
                .filter(illustration -> illustration.getStub().equals(illustrationHash))
                .findFirst()
                .ifPresentOrElse(
                    illustration -> fileStorageService.deleteFile(illustration.getFileKey()),
                    () -> {
                        throw new NoSuchElementException("Illustration not found");
                    }
                );

        ebookProject.getIllustrations().removeIf(illustration -> illustration.getStub().equals(illustrationHash));
        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));
        ebookProjectRepository.save(ebookProject);
    }

    public EbookProject updateEbookProject(String ebookProjectId, EbookProject newEbookProject) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);

        ebookProject.setAuthor(newEbookProject.getAuthor());
        ebookProject.setDescription(newEbookProject.getDescription());
        ebookProject.setTags(newEbookProject.getTags());
        ebookProject.setName(newEbookProject.getName());
        ebookProject.setIsPublic(newEbookProject.getIsPublic());
        ebookProject.setContainerName(newEbookProject.getContainerName());
        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));

        if (ebookProject.getIsPublic() == null) {
            ebookProject.setIsPublic(false);
        }

        if (this.validatorService.isValid(ebookProject)) {
            ebookProjectRepository.save(ebookProject);
            return ebookProject;
        } else {
            throw new IllegalArgumentException("Invalid ebook project data (bean validation failed)");
        }
    }

    public void deleteEbookProject(String ebookProjectId) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);

        String coverImageKey = ebookProject.getCoverImageKey();
        if (coverImageKey != null) {
            fileStorageService.deleteFile(coverImageKey);
        }

        if (ebookProject.getIllustrations() != null) {
            for (EbookProjectIllustration illustration : ebookProject.getIllustrations()) {
                fileStorageService.deleteFile(illustration.getFileKey());
            }
        }

        if (ebookProject.getDownloadableFiles() != null) {
            for (var resource : ebookProject.getDownloadableFiles()) {
                fileStorageService.deleteFile(resource.getFileKey());
            }
        }

        ebookProjectRepository.deleteById(ebookProjectId);
    }

    public List<EbookProject> listEbookProjectsOfAuthenticatedUser() {
        authorizationProvider.requireAuthentication();
        return ebookProjectRepository.findByOwnerUserId(authorizationProvider.getAuthenticatedUserId());
    }

    public EbookProject getEbookProject(String ebookProjectId) {
        return permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_ONLY);
    }

    public String getDownloadableUrl(String ebookProjectId, String downloadableResourceStub) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_ONLY);

        EbookDownloadableResource downloadableResource = ebookProject.getDownloadableFiles()
                .stream()
                .filter(resource -> resource.getStub().equals(downloadableResourceStub))
                .findFirst()
                .orElseThrow();

        String fileName = StringNormalizer.normalize(ebookProject.getName()) + "." + downloadableResource.getFormat().getExtensionName();
        return fileStorageService.getDownloadUrl(downloadableResource.getFileKey(), fileName);
    }

    @SneakyThrows(IOException.class)
    private EbookDownloadableResource addFormat(EbookProject ebookProject, EbookFormat ebookFormat) {
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            Path targetPath = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), "out." + ebookFormat.getExtensionName());
            ebookProjectConversionService.convertEbookProjectToPhysicalFile(ebookProject, targetPath);

            this.diskUsageCalculator.requireDiskSpace(Files.size(targetPath));

            String randomKey = RandomStringUtils.randomAlphanumeric(64);
            String uploadFileKey = "ebook-projects/downloadables/%s/%s.%s"
                    .formatted(ebookProject.getOwnerUserId(), randomKey, ebookFormat.getExtensionName());
            fileStorageService.uploadFile(uploadFileKey, targetPath.toFile());

            var downloadableResource = new EbookDownloadableResource(randomKey, ebookFormat, new Date(), uploadFileKey);
            ebookProject.getDownloadableFiles().add(0, downloadableResource);

            ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));
            ebookProjectRepository.save(ebookProject);
            return downloadableResource;
        }
    }

    public String convertToDownloadableUrl(String ebookProjectId, String ebookFileFormat) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        EbookFormat ebookFormat = EbookFormat.fromExtension(ebookFileFormat);
        if (ebookFormat == null) {
            throw new IllegalArgumentException("Invalid ebook file format");
        }

        EbookDownloadableResource res = addFormat(ebookProject, ebookFormat);
        String fileName = StringNormalizer.normalize(ebookProject.getName()) + "." + ebookFormat.getExtensionName();
        return fileStorageService.getDownloadUrl(res.getFileKey(), fileName);
    }

    public void deleteEbookFormat(String ebookProjectId, String downloadableResourceStub) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        var ebookFormatRes = ebookProject.getDownloadableFiles()
                .stream()
                .filter(resource -> resource.getStub().equals(downloadableResourceStub))
                .findFirst()
                .orElseThrow();

        fileStorageService.deleteFile(ebookFormatRes.getFileKey());
        ebookProject.getDownloadableFiles().remove(ebookFormatRes);
        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));
        ebookProjectRepository.save(ebookProject);
    }

    public String getCoverImageUrl(String ebookProjectId) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_ONLY);
        return this.fileStorageService.getDownloadUrl(ebookProject.getCoverImageKey());
    }

    public EbookProject deleteCoverImage(String ebookProjectId) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);

        if (ebookProject.getCoverImageKey() != null) {
            fileStorageService.deleteFile(ebookProject.getCoverImageKey());
            ebookProject.setCoverImageKey(null);
        }

        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));
        return ebookProjectRepository.save(ebookProject);
    }

    public String getIllustrationImageUrl(String ebookProjectId, String illustrationHash) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_ONLY);
        var illustration = ebookProject.getIllustrations()
                .stream()
                .filter(ill -> ill.getStub().equals(illustrationHash))
                .findFirst()
                .orElseThrow();

        return fileStorageService.getDownloadUrl(illustration.getFileKey());
    }

    public QueueTask<QueueTaskPayload> enqueueConvertEbookProjectToEbookFile(String ebookProjectId, String targetFormat) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        assert ebookProject != null;
        this.diskUsageCalculator.requireDiskSpace(ebookProject.getTotalSizeBytes() * 2);

        ConversionQueueTaskPayload conversionQueueTaskPayload = new ConversionQueueTaskPayload(
                ebookProjectId,
                ConversionQueueTaskType.PROJECT_TO_FILE,
                targetFormat);

        return conversionQueueService.enqueueConversionTask(conversionQueueTaskPayload);
    }

    public QueueTask<QueueTaskPayload> enqueueSendToReader(String ebookProjectId, String ebookFileFormat, String targetEmail) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_ONLY);
        assert ebookProject != null;

        EbookFormat ebookFormat = EbookFormat.fromExtension(ebookFileFormat);
        if (ebookFormat == null) {
            throw new IllegalArgumentException("Invalid ebook file format");
        }

        EbookDownloadableResource res = addFormat(ebookProject, ebookFormat);

        var attachment = new EmailQueueTaskPayload.EmailQueueTaskPayloadAttachment(
                "ebook." + ebookFileFormat,
                res.getFileKey()
        );

        EmailQueueTaskPayload emailQueueTaskPayload = new EmailQueueTaskPayload(
                targetEmail,
                "Your ebook from ebook-wizard",
                "Here is your requested ebook file",
                List.of(attachment)
        );

        return emailQueueService.enqueueEmail(emailQueueTaskPayload);
    }
}
