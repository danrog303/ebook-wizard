package com.github.danrog303.ebookwizard.domain.ebook.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor @AllArgsConstructor
public class EbookFolder {
    private String name;
    private Long bookCount;
}
