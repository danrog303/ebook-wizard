package com.github.danrog303.ebookwizard.domain.ebook;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

@Getter @RequiredArgsConstructor @ToString
public enum EbookFormat {
    EPUB("epub"),
    MOBI("mobi"),
    AZW3("azw3"),
    PDF("pdf"),
    TXT("txt"),
    HTML("html"),
    DOCX("docx");

    private final String extensionName;
}
