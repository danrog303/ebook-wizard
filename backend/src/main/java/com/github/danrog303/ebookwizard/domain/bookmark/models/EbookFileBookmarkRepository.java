package com.github.danrog303.ebookwizard.domain.bookmark.models;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface EbookFileBookmarkRepository extends MongoRepository<EbookFileBookmark, String> {
    Optional<EbookFileBookmark> findByEbookFileIdAndUserId(String ebookFileId, String userId);
}
