package com.github.danrog303.ebookwizard.domain.bookmark.models;

import lombok.Data;
import org.springframework.data.annotation.Id;

import java.util.List;

@Data
public class EbookFileBookmark {
    @Id
    private String id;

    private String ebookFileId;

    private String userId;

    private List<Long> bookmarkedPages;
}
