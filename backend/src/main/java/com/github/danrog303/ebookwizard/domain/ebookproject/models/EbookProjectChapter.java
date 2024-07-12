package com.github.danrog303.ebookwizard.domain.ebookproject.models;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor @NoArgsConstructor
public class EbookProjectChapter {
    @NotNull
    private String id;

    @NotNull
    private String name;

    @NotNull
    private String contentHtml;

    @NotNull
    private Date creationDate;

    @NotNull
    private Date lastModifiedDate;

    public EbookProjectChapter(String name, String contentHtml) {
        this.name = name;
        this.contentHtml = contentHtml;
        this.creationDate = new Date();
        this.lastModifiedDate = new Date();
    }
}
