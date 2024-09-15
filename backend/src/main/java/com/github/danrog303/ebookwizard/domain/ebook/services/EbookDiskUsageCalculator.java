package com.github.danrog303.ebookwizard.domain.ebook.services;

import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFile;
import com.github.danrog303.ebookwizard.domain.ebookfile.models.EbookFileRepository;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectRepository;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EbookDiskUsageCalculator {
    private final EbookProjectRepository projectRepository;
    private final EbookFileRepository fileRepository;
    private final FileStorageService fileStorageService;

    public long calculateEbookProjectSize(EbookProject project) {
        long totalSizeBytes = 0;

        if (project.getCoverImageKey() != null) {
            long coverImageSize = fileStorageService.getFileSize(project.getCoverImageKey());
            totalSizeBytes += coverImageSize;
        }

        for (var chapter : project.getChapters()) {
            long chapterNameSize = chapter.getName().length();
            long chapterTextSize = chapter.getContentHtml().length();
            totalSizeBytes += chapterNameSize;
            totalSizeBytes += chapterTextSize;
        }

        for (var illustration : project.getIllustrations()) {
            long illustrationSize = fileStorageService.getFileSize(illustration.getFileKey());
            totalSizeBytes += illustrationSize;
        }

        for (var file : project.getDownloadableFiles()) {
            long fileSize = fileStorageService.getFileSize(file.getFileKey());
            totalSizeBytes += fileSize;
        }

        return totalSizeBytes;
    }

    public long calculateEbookProjectSize(String ebookProjectId) {
        var project = projectRepository.findById(ebookProjectId).orElseThrow();
        return calculateEbookProjectSize(project);
    }

    public long calculateEbookFileSize(EbookFile ebookFile) {
        long totalSizeBytes = 0;

        if (ebookFile.getCoverImageKey() != null) {
            long coverImageSize = fileStorageService.getFileSize(ebookFile.getCoverImageKey());
            totalSizeBytes += coverImageSize;
        }

        for (var fileRevision : ebookFile.getDownloadableFiles()) {
            long fileSize = fileStorageService.getFileSize(fileRevision.getFileKey());
            totalSizeBytes += fileSize;
        }

        return totalSizeBytes;
    }

    public long calculateEbookFileSize(String ebookFileId) {
        var file = fileRepository.findById(ebookFileId).orElseThrow();
        return calculateEbookFileSize(file);
    }

    public long calculateDiskUsage() {
        long totalSizeBytes = 0;

        for (var project : projectRepository.findAll()) {
            totalSizeBytes += project.getTotalSizeBytes();
        }

        for (var file : fileRepository.findAll()) {
            totalSizeBytes += file.getTotalSizeBytes();
        }

        return totalSizeBytes;
    }
}
