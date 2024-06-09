package com.github.danrog303.ebookwizard.domain.ebookfile;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface EbookFileRepository extends MongoRepository<EbookFile, String> {
}
