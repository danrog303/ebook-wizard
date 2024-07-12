package com.github.danrog303.ebookwizard.domain.ebookproject.services;

import com.github.danrog303.ebookwizard.domain.ebook.EbookAccessType;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProject;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectChapter;
import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class EbookProjectChapterService {
    private final EbookProjectRepository ebookProjectRepository;
    private final EbookProjectPermissionService permissionService;

    public EbookProjectChapter createChapter(String ebookProjectId, EbookProjectChapter chapter) {
        validateChapter(chapter);

        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        chapter.setId(RandomStringUtils.randomAlphanumeric(64));
        chapter.setLastModifiedDate(new Date());
        chapter.setCreationDate(new Date());
        ebookProject.getChapters().add(chapter);

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
        ebookProjectRepository.save(ebookProject);
    }

    public EbookProjectChapter updateChapter(String ebookProjectId, String chapterId, EbookProjectChapter chapter) {
        validateChapter(chapter);

        EbookProject ebookProject = permissionService.getEbookProject(ebookProjectId, EbookAccessType.READ_WRITE);
        EbookProjectChapter existingChapter = ebookProject.getChapters()
                .stream()
                .filter(c -> c.getId().equals(chapterId))
                .findFirst()
                .orElseThrow();

        existingChapter.setName(chapter.getName());
        existingChapter.setContentHtml(chapter.getContentHtml());
        existingChapter.setLastModifiedDate(new Date());

        ebookProjectRepository.save(ebookProject);
        return existingChapter;
    }

    private void validateChapter(EbookProjectChapter chapter) {
        if (chapter.getName() == null || chapter.getName().isEmpty()) {
            throw new IllegalArgumentException("Chapter name must not be empty");
        }
        if (chapter.getContentHtml() == null) {
            chapter.setContentHtml("");
        }
    }
}
