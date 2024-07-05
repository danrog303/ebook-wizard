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
        return this.tika.detect(data);
    }

    @Override
    public String detectMimeType(File filePath) throws IOException {
        return this.tika.detect(filePath);
    }

    @Override
    public String detectMimeType(InputStream inputStream) throws IOException {
        return this.tika.detect(inputStream);
    }
}
