package com.github.danrog303.ebookwizard.external.mime;

import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;

import static org.assertj.core.api.Assertions.assertThat;

public class ApacheTikaMimeTypeTypeDetectorTest {
    private final MimeTypeDetector mimeTypeDetector = new ApacheTikaMimeTypeDetector();

    @ParameterizedTest
    @EnumSource(EbookFormat.class)
    public void testDetectMimeType_byStreamOpening(EbookFormat format) throws IOException {
        String extensionName = format.getExtensionName();
        String resourceFilePath = "samples/sample-%s.%s".formatted(format.getExtensionName(), extensionName);
        String expectedMimeType = format.getMimeType();

        URL url = Thread.currentThread().getContextClassLoader().getResource(resourceFilePath);
        assertThat(url).isNotNull();

        try (InputStream inputStream = url.openStream()) {
            String mimeType = mimeTypeDetector.detectMimeType(inputStream);
            assertThat(mimeType).isEqualTo(expectedMimeType);
        }
    }

    @ParameterizedTest
    @EnumSource(EbookFormat.class)
    public void testDetectMimeType_bySpecifyingByteArray(EbookFormat format)
            throws IOException {
        String extensionName = format.getExtensionName();
        String resourceFilePath = "samples/sample-%s.%s".formatted(format.getExtensionName(), extensionName);
        String expectedMimeType = format.getMimeType();

        URL url = Thread.currentThread().getContextClassLoader().getResource(resourceFilePath);
        assertThat(url).isNotNull();

        try (InputStream inputStream = url.openStream()) {
            byte[] bytes = inputStream.readAllBytes();
            String mimeType = mimeTypeDetector.detectMimeType(bytes);
            assertThat(mimeType).isEqualTo(expectedMimeType);
        }
    }

    @ParameterizedTest
    @EnumSource(EbookFormat.class)
    public void testDetectMimeType_bySpecifyingFile(EbookFormat format) throws IOException, URISyntaxException {
        String extensionName = format.getExtensionName();
        String resourceFilePath = "samples/sample-%s.%s".formatted(format.getExtensionName(), extensionName);
        String expectedMimeType = format.getMimeType();

        URL url = Thread.currentThread().getContextClassLoader().getResource(resourceFilePath);
        assertThat(url).isNotNull();

        File file = new File(url.toURI().getPath());
        String mimeType = mimeTypeDetector.detectMimeType(file);
        assertThat(mimeType).isEqualTo(expectedMimeType);
    }
}
