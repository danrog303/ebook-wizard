package com.github.danrog303.ebookwizard.domain.bookmark.services;

import com.github.danrog303.ebookwizard.domain.bookmark.models.EbookFileBookmark;
import com.github.danrog303.ebookwizard.domain.bookmark.models.EbookFileBookmarkRepository;
import com.github.danrog303.ebookwizard.external.auth.AuthorizationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EbookFileBookmarkService {
    private final EbookFileBookmarkRepository ebookFileBookmarkRepository;
    private final AuthorizationProvider authorizationProvider;

    public EbookFileBookmark getBookmarksForEbookFile(String ebookFileId) {
        var userId = this.authorizationProvider.getAuthenticatedUserId();
        var bookmark = this.ebookFileBookmarkRepository.findByEbookFileIdAndUserId(ebookFileId, userId);

        if (bookmark.isEmpty()) {
            var newBookmark = new EbookFileBookmark();
            newBookmark.setEbookFileId(ebookFileId);
            newBookmark.setUserId(userId);
            newBookmark.setBookmarkedPages(List.of());
            return this.ebookFileBookmarkRepository.save(newBookmark);
        } else {
            return bookmark.get();
        }
    }

    public EbookFileBookmark updateBookmarksForEbookFile(String ebookFileId, List<Long> bookmarkedPages) {
        var bookmark = this.getBookmarksForEbookFile(ebookFileId);
        bookmark.setBookmarkedPages(bookmarkedPages);
        return this.ebookFileBookmarkRepository.save(bookmark);
    }
}
