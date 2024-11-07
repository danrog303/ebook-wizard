package com.github.danrog303.ebookwizard.domain.bookmark.controllers;

import com.github.danrog303.ebookwizard.domain.bookmark.models.EbookFileBookmark;
import com.github.danrog303.ebookwizard.domain.bookmark.services.EbookFileBookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class EbookFileBookmarkController {
    private final EbookFileBookmarkService ebookFileBookmarkService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/ebook-file/{ebookFileId}/bookmarks")
    public EbookFileBookmark getBookmarksForEbookFile(@PathVariable String ebookFileId) {
        return this.ebookFileBookmarkService.getBookmarksForEbookFile(ebookFileId);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/ebook-file/{ebookFileId}/bookmarks")
    public EbookFileBookmark updateBookmarksForEbookFile(@PathVariable String ebookFileId,
                                            @RequestBody List<Long> bookmarkedPages) {
        return this.ebookFileBookmarkService.updateBookmarksForEbookFile(ebookFileId, bookmarkedPages);
    }
}
