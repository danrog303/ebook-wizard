package com.github.danrog303.ebookwizard.external.document.metadata;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
public class DocumentMetadata {
    private String name;
    private String author;
    private String description;
    private List<String> tags;

    public boolean isEmpty() {
        return name == null && author == null && description == null && tags == null;
    }
}
