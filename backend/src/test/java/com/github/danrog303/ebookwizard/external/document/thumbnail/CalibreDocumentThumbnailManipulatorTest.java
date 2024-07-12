package com.github.danrog303.ebookwizard.external.document.thumbnail;

import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import com.github.danrog303.ebookwizard.external.mime.ApacheTikaMimeTypeDetector;
import com.github.danrog303.ebookwizard.external.mime.MimeTypeDetector;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import lombok.SneakyThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatNoException;

public class CalibreDocumentThumbnailManipulatorTest {
    private final DocumentThumbnailManipulator manipulator = new CalibreDocumentThumbnailManipulator();
    private final MimeTypeDetector mimeTypeDetector = new ApacheTikaMimeTypeDetector();

    @SneakyThrows
    @ParameterizedTest
    @EnumSource(EbookFormat.class)
    public void test_extractThumbnail(EbookFormat format) {
        var loader = CalibreDocumentThumbnailManipulatorTest.class.getClassLoader();

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            String resourceName = "samples/sample-%s.%s".formatted(format.getExtensionName(), format.getExtensionName());
            Path documentPath = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), "doc." + format.getExtensionName());
            Path thumbnailPath = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), "thumbnail.jpg");

            try (InputStream inputStream = loader.getResourceAsStream(resourceName)) {
                assert inputStream != null;
                Files.copy(inputStream, documentPath);
                manipulator.extractThumbnail(documentPath, thumbnailPath);

                String mimeType = mimeTypeDetector.detectMimeType(thumbnailPath.toFile());
                assertThat(Files.size(thumbnailPath)).isGreaterThan(0);
                assertThat(mimeType).isEqualTo("image/jpeg");
            }
        }
    }

    @Test
    @SneakyThrows
    public void test_setThumbnail() {
        var loader = CalibreDocumentThumbnailManipulatorTest.class.getClassLoader();

        assertThatNoException().isThrownBy(() -> {
            try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
                String ebookResourceName = "samples/sample-epub.epub";
                String coverResourceName = "images/image-jpg.jpg";

                Path ebookPath = tempDir.getDirectory().resolve("ebook.epub");
                Path thumbnailPath = tempDir.getDirectory().resolve("thumbnail.jpg");

                Files.copy(Objects.requireNonNull(loader.getResourceAsStream(ebookResourceName)), ebookPath);
                Files.copy(Objects.requireNonNull(loader.getResourceAsStream(coverResourceName)), thumbnailPath);
                manipulator.setThumbnail(ebookPath, thumbnailPath);
            }
        });
    }
}
