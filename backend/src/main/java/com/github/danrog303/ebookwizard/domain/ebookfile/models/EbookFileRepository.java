package com.github.danrog303.ebookwizard.domain.ebookfile.models;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EbookFileRepository extends MongoRepository<EbookFile, String> {
    List<EbookFile> findAllByOwnerUserId(String ownerUserId);
}
