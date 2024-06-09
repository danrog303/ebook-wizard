package com.github.danrog303.ebookwizard.domain.ebookproject;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface EbookProjectRepository extends MongoRepository<EbookProject, String> {
}
