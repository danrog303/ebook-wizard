package com.github.danrog303.ebookwizard.domain.ebookproject.models;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface EbookProjectRepository extends MongoRepository<EbookProject, String> {
    List<EbookProject> findByOwnerUserId(String ownerUserId);
}
