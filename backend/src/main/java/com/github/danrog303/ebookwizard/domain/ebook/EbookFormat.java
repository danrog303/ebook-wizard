package com.github.danrog303.ebookwizard.domain.ebook;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

@Getter @RequiredArgsConstructor @ToString
public enum EbookFormat {
    EPUB("epub", "application/epub+zip", true),
    MOBI("mobi", "application/x-mobipocket-ebook", true),
    AZW3("azw3", "application/x-mobipocket-ebook", true),  // mobi and azw3 share the same mime type
    PDF("pdf", "application/pdf", true),
    TXT("txt", "text/plain", false),
    HTML("html", "text/html", false),
    DOCX("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", true);

    private final String extensionName;
    private final String mimeType;

    // Whether the format supports metadata (ebook formats) or not (HTML, TXT).
    private final boolean hasMetadata;

    public static EbookFormat fromMimeType(String mimeType) {
        for (EbookFormat format : values()) {
            if (format.getMimeType().equalsIgnoreCase(mimeType)) {
                return format;
            }
        }
        return null;
    }

    public static EbookFormat fromExtension(String extension) {
        for (EbookFormat format : values()) {
            if (format.getExtensionName().equalsIgnoreCase(extension)) {
                return format;
            }
        }
        return null;
    }
}
