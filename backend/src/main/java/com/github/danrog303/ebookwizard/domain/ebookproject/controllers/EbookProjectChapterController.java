package com.github.danrog303.ebookwizard.domain.ebookproject.controllers;

import com.github.danrog303.ebookwizard.domain.ebookproject.models.EbookProjectChapter;
import com.github.danrog303.ebookwizard.domain.ebookproject.services.EbookProjectChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ebook-project")
@RequiredArgsConstructor
public class EbookProjectChapterController {
    private final EbookProjectChapterService ebookProjectChapterService;

    @PostMapping("/{ebookProjectId}/chapter")
    @ResponseStatus(HttpStatus.CREATED)
    public EbookProjectChapter createChapter(@PathVariable String ebookProjectId, @RequestBody EbookProjectChapter chapter) {
        return this.ebookProjectChapterService.createChapter(ebookProjectId, chapter);
    }

    @DeleteMapping("/{ebookProjectId}/chapter/{chapterId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteChapter(@PathVariable String ebookProjectId, @PathVariable String chapterId) {
        this.ebookProjectChapterService.deleteChapter(ebookProjectId, chapterId);
    }

    @PutMapping("/{ebookProjectId}/chapter/{chapterId}")
    public EbookProjectChapter updateChapter(@PathVariable String ebookProjectId,
                              @PathVariable String chapterId,
                              @RequestBody EbookProjectChapter chapter) {
        return this.ebookProjectChapterService.updateChapter(ebookProjectId, chapterId, chapter);
    }

    @PutMapping("/{ebookProjectId}/chapter/reorder/{oldIndex}/{newIndex}")
    public void reorderChapters(@PathVariable String ebookProjectId,
                                @PathVariable int oldIndex,
                                @PathVariable int newIndex) {
        this.ebookProjectChapterService.reorderChapters(ebookProjectId, oldIndex, newIndex);
    }
}
