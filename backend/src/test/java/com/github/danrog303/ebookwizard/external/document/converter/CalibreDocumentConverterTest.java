package com.github.danrog303.ebookwizard.external.document.converter;

import com.github.danrog303.ebookwizard.external.document.converter.CalibreDocumentConverter;
import com.github.danrog303.ebookwizard.external.document.converter.DocumentConverter;
import com.github.danrog303.ebookwizard.external.mime.ApacheTikaMimeTypeDetector;
import com.github.danrog303.ebookwizard.external.mime.MimeTypeDetector;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class CalibreDocumentConverterTest {
    private final DocumentConverter documentConverter = new CalibreDocumentConverter();
    private final MimeTypeDetector mimeTypeDetector = new ApacheTikaMimeTypeDetector();

    @Test
    public void convertEbookFile_epubToPdf() throws URISyntaxException, IOException {
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            String inputResourceName = "samples/sample-epub.epub";
            URL inputResourceUrl = Thread.currentThread().getContextClassLoader().getResource(inputResourceName);
            assert inputResourceUrl != null;

            Path ebookFilePath = Paths.get(inputResourceUrl.toURI());
            Path outputFilePath = Paths.get(tempDir.getDirectory().toString(), "output.pdf");

            this.documentConverter.convertDocument(ebookFilePath, outputFilePath);
            String mimeType = mimeTypeDetector.detectMimeType(outputFilePath.toFile());
            assertThat(mimeType).isEqualTo("application/pdf");
        }
    }

    @Test
    public void convertEbookFile_mobiToTxt_shouldNotThrowExceptions() throws URISyntaxException, IOException {
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            String inputResourceName = "samples/sample-mobi.mobi";
            URL inputResourceUrl = Thread.currentThread().getContextClassLoader().getResource(inputResourceName);
            assert inputResourceUrl != null;

            Path ebookFilePath = Paths.get(inputResourceUrl.toURI());
            Path outputFilePath = Paths.get(tempDir.getDirectory().toString(), "output.txt");

            this.documentConverter.convertDocument(ebookFilePath, outputFilePath);
            String mimeType = mimeTypeDetector.detectMimeType(outputFilePath.toFile());
            assertThat(mimeType).isEqualTo("text/plain");
        }
    }

    @Test
    public void convertEbookFile_mobiToHtml_shouldNotThrowExceptions() throws URISyntaxException, IOException {
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            String inputResourceName = "samples/sample-mobi.mobi";
            URL inputResourceUrl = Thread.currentThread().getContextClassLoader().getResource(inputResourceName);
            assert inputResourceUrl != null;

            Path ebookFilePath = Paths.get(inputResourceUrl.toURI());
            Path outputFilePath = Paths.get(tempDir.getDirectory().toString(), "output.html");

            this.documentConverter.convertDocument(ebookFilePath, outputFilePath);
            String mimeType = mimeTypeDetector.detectMimeType(outputFilePath.toFile());
            assertThat(mimeType).isEqualTo("text/html");
        }

    }

    @Test
    public void convertEbookFile_htmlToMobi_shouldNotThrowExceptions() throws URISyntaxException, IOException {
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            String inputResourceName = "samples/sample-html.html";
            URL inputResourceUrl = Thread.currentThread().getContextClassLoader().getResource(inputResourceName);
            assert inputResourceUrl != null;

            Path ebookFilePath = Paths.get(inputResourceUrl.toURI());
            Path outputFilePath = Paths.get(tempDir.getDirectory().toString(), "output.mobi");

            this.documentConverter.convertDocument(ebookFilePath, outputFilePath);
            String mimeType = mimeTypeDetector.detectMimeType(outputFilePath.toFile());
            assertThat(mimeType).isEqualTo("application/x-mobipocket-ebook");
        }
    }
}
