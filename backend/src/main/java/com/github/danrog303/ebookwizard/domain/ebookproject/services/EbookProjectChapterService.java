package com.github.danrog303.ebookwizard.domain.ebookproject.services;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookAccessType;
import com.github.danrog303.ebookwizard.domain.ebook.services.EbookDiskUsageCalculator;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectChapter;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectRepository;
import com.github.danrog303.ebookwizard.domain.errorhandling.exceptions.FileStorageQuotaExceededException;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class EbookProjectChapterService {
    private final EbookProjectRepository ebookProjectRepository;
    private final EbookProjectPermissionService permissionService;
    private final FileStorageService fileStorageService;
    private final EbookDiskUsageCalculator diskUsageCalculator;

    public final int MAX_CHAPTER_CONTENT_SIZE = 4 * 1024 * 1024; // 4 MB
    public final int MAX_COMBINED_CHAPTER_CONTENT_SIZE = 10 * 1024 * 1024; // 10 MB

    public EbookProjectChapter createChapter(String ebookProjectId, EbookProjectChapter chapter) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        validateChapter(ebookProject, chapter);
        this.diskUsageCalculator.requireDiskSpace(chapter.getContentHtml().length());

        chapter.setId(RandomStringUtils.randomAlphanumeric(64));
        chapter.setLastModifiedDate(new Date());
        chapter.setCreationDate(new Date());
        ebookProject.getChapters().add(chapter);

        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));
        ebookProjectRepository.save(ebookProject);
        return chapter;
    }

    public void deleteChapter(String ebookProjectId, String chapterId) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        EbookProjectChapter chapter = ebookProject.getChapters()
                .stream()
                .filter(c -> c.getId().equals(chapterId))
                .findFirst()
                .orElseThrow();

        ebookProject.getChapters().remove(chapter);

        // Detect illustrations that are no longer used
        this.removeStaleIllustrations(ebookProject);

        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));
        ebookProjectRepository.save(ebookProject);
    }

    public EbookProjectChapter updateChapter(String ebookProjectId, String chapterId, EbookProjectChapter chapter) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        validateChapter(ebookProject, chapter);
        this.diskUsageCalculator.requireDiskSpace(chapter.getContentHtml().length());

        EbookProjectChapter existingChapter = ebookProject.getChapters()
                .stream()
                .filter(c -> c.getId().equals(chapterId))
                .findFirst()
                .orElseThrow();

        existingChapter.setName(chapter.getName());
        existingChapter.setContentHtml(chapter.getContentHtml());
        existingChapter.setLastModifiedDate(new Date());

        // Detect illustrations that are no longer used
        this.removeStaleIllustrations(ebookProject);

        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));
        ebookProjectRepository.save(ebookProject);
        return existingChapter;
    }

    public void reorderChapters(String ebookProjectId, int oldIndex, int newIndex) {
        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        EbookProjectChapter chapter = ebookProject.getChapters().remove(oldIndex);
        ebookProject.getChapters().add(newIndex, chapter);

        ebookProjectRepository.save(ebookProject);
    }

    private void removeStaleIllustrations(EbookProject ebookProject) {
        boolean[] illustrationIsUsed = new boolean[ebookProject.getIllustrations().size()];

        for (EbookProjectChapter chapter : ebookProject.getChapters()) {
            for (int i = 0; i < illustrationIsUsed.length; i++) {
                if (chapter.getContentHtml().contains(ebookProject.getIllustrations().get(i).getStub())) {
                    illustrationIsUsed[i] = true;
                }
            }
        }

        for (int i = illustrationIsUsed.length - 1; i >= 0; i--) {
            if (!illustrationIsUsed[i]) {
                var illustration = ebookProject.getIllustrations().get(i);
                fileStorageService.deleteFile(illustration.getFileKey());
                ebookProject.getIllustrations().remove(i);
            }
        }

        ebookProject.setTotalSizeBytes(diskUsageCalculator.calculateEbookProjectSize(ebookProject));
        ebookProjectRepository.save(ebookProject);
    }

    private void validateChapter(EbookProject project, EbookProjectChapter chapter) {
        if (chapter.getName() == null || chapter.getName().isEmpty()) {
            throw new IllegalArgumentException("Chapter name must not be empty");
        }
        if (chapter.getContentHtml() == null) {
            chapter.setContentHtml("");
        }

        if (chapter.getContentHtml().length() > MAX_CHAPTER_CONTENT_SIZE) {
            throw new FileStorageQuotaExceededException("Chapter content is too large");
        }

        long combinedChapterContentSize = project.getChapters().stream()
                .mapToLong(c -> c.getContentHtml().length())
                .sum() + chapter.getContentHtml().length();

        if (combinedChapterContentSize > MAX_COMBINED_CHAPTER_CONTENT_SIZE) {
            throw new FileStorageQuotaExceededException("Combined chapter content is too large");
        }
    }
}
