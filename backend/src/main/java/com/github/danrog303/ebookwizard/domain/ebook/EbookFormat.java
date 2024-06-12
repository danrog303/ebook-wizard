package com.github.danrog303.ebookwizard.domain.ebook;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

@Getter @RequiredArgsConstructor @ToString
public enum EbookFormat {
    EPUB("epub", "application/epub+zip"),
    MOBI("mobi", "application/x-mobipocket-ebook"),
    AZW3("azw3", "application/vnd.amazon.ebook"),
    PDF("pdf", "application/pdf"),
    TXT("txt", "text/plain"),
    HTML("html", "text/html"),
    DOCX("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    private final String extensionName;
    private final String mimeType;
}
