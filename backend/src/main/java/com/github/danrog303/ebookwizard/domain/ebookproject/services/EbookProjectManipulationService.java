package com.github.danrog303.ebookwizard.domain.ebookproject.services;

import com.github.danrog303.ebookwizard.domain.ebook.EbookAccessType;
import com.github.danrog303.ebookwizard.domain.ebook.EbookDownloadableResource;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFileLock;
import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectIllustration;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectRepository;
import com.github.danrog303.ebookwizard.external.auth.AuthorizationProvider;
import com.github.danrog303.ebookwizard.external.image.ImageConverter;
import com.github.danrog303.ebookwizard.external.mime.MimeTypeDetector;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
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

    public EbookProject createEmptyEbookProject(EbookProject ebookProject) {
        authorizationProvider.requireAuthentication();

        ebookProject.setId(null);
        ebookProject.setCreationDate(new Date());
        ebookProject.setChapters(new ArrayList<>());
        ebookProject.setCoverImageKey(null);
        ebookProject.setLock(new EbookFileLock(false, null));
        ebookProject.setIllustrations(new ArrayList<>());
        ebookProject.setDownloadableFiles(new ArrayList<>());
        ebookProject.setOwnerUserId(authorizationProvider.getAuthenticatedUserId());

        if (ebookProject.getIsPublic() == null) {
            ebookProject.setIsPublic(false);
        }

        return ebookProjectRepository.save(ebookProject);
    }

    @SneakyThrows(IOException.class)
    public EbookProject uploadIllustrationImage(String ebookProjectId, MultipartFile illustrationImageFile) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
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
        return ebookProjectRepository.save(ebookProject);
    }

    @SneakyThrows(IOException.class)
    public EbookProject updateCoverImage(String ebookProjectId, MultipartFile coverImageFile) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        String currentUserId = authorizationProvider.getAuthenticatedUserId();

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

        if (ebookProject.getIsPublic() == null) {
            ebookProject.setIsPublic(false);
        }

        return ebookProject;
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

        return fileStorageService.getDownloadUrl(downloadableResource.getFileKey());
    }

    @SneakyThrows(IOException.class)
    public String convertToDownloadableUrl(String ebookProjectId, String ebookFileFormat) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_ONLY);

        EbookFormat ebookFormat = EbookFormat.fromExtension(ebookFileFormat);
        if (ebookFormat == null) {
            throw new IllegalArgumentException("Invalid ebook file format");
        }

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            Path targetPath = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), "out." + ebookFormat.getExtensionName());
            ebookProjectConversionService.convertEbookProjectToPhysicalFile(ebookProject, targetPath);

            String randomKey = RandomStringUtils.randomAlphanumeric(64);
            String uploadFileKey = "ebook-projects/downloadables/%s/%s.%s"
                    .formatted(ebookProject.getOwnerUserId(), randomKey, ebookFormat.getExtensionName());
            fileStorageService.uploadFile(uploadFileKey, targetPath.toFile());

            var downloadableResource = new EbookDownloadableResource(randomKey, ebookFormat, new Date(), uploadFileKey);
            ebookProject.getDownloadableFiles().add(downloadableResource);
            ebookProjectRepository.save(ebookProject);

            return fileStorageService.getDownloadUrl(uploadFileKey);
        }
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
        ebookProjectRepository.save(ebookProject);
    }
}
