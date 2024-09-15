package com.github.danrog303.ebookwizard.external.document.converter;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookFormat;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Path;

public interface DocumentConverter {
    void convertDocument(Path documentInputPath, Path documentOutputPath);
    void convertDocument(InputStream inputStream, OutputStream outputStream,
                         EbookFormat inputFormat, EbookFormat outputFormat);
}
