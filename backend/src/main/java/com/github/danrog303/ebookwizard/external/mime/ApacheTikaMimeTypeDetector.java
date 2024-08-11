package com.github.danrog303.ebookwizard.external.mime;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

@Service
public class ApacheTikaMimeTypeDetector implements MimeTypeDetector {
    private final Tika tika = new Tika();

    @Override
    public String detectMimeType(byte[] data) {
        String mime = this.tika.detect(data);
        return applyOverrides(mime);
    }

    @Override
    public String detectMimeType(File filePath) throws IOException {
        String mime = this.tika.detect(filePath);
        return applyOverrides(mime);
    }

    @Override
    public String detectMimeType(InputStream inputStream) throws IOException {
        String mime = this.tika.detect(inputStream);
        return applyOverrides(mime);
    }

    private String applyOverrides(String mime) {
        return switch (mime) {
            case "application/xhtml+xml" -> "text/html";
            default -> mime;
        };
    }
}
