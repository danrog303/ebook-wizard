package com.github.danrog303.ebookwizard.domain.ebookproject.database;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface EbookProjectRepository extends MongoRepository<EbookProject, String> {
}
