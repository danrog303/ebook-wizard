package com.github.danrog303.ebookwizard.domain.comicbook.models;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface ComicBookRepository extends MongoRepository<ComicBook, String> {
}
