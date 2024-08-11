package com.github.danrog303.ebookwizard.external.images;

import com.github.danrog303.ebookwizard.external.image.ImageIOConverter;
import com.github.danrog303.ebookwizard.external.image.ImageConverter;
import com.github.danrog303.ebookwizard.external.mime.ApacheTikaMimeTypeDetector;
import com.github.danrog303.ebookwizard.external.mime.MimeTypeDetector;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;

import static org.assertj.core.api.Assertions.assertThat;

public class ImageIOConverterTest {
    private final ImageConverter imageConverter = new ImageIOConverter();
    private final MimeTypeDetector mimeTypeDetector = new ApacheTikaMimeTypeDetector();

    @Test
    public void test_convertTo_webpToPng() throws IOException {
        try (var webpImage = this.getClass().getClassLoader().getResourceAsStream("images/image-webp.webp")) {
            try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
                var inputPath = tempDir.getDirectory().resolve("image-webp.webp");
                var outputPath = tempDir.getDirectory().resolve("image-png.png");

                assertThat(webpImage).isNotNull();
                Files.copy(webpImage, inputPath);
                assertThat(mimeTypeDetector.detectMimeType(inputPath.toFile())).isEqualTo("image/webp");

                imageConverter.convertTo(inputPath, outputPath, "png");
                assertThat(mimeTypeDetector.detectMimeType(outputPath.toFile())).isEqualTo("image/png");
            }
        }
    }

    @Test
    public void test_convertTo_jpgToPng() throws IOException {
        try (var jpgImage = this.getClass().getClassLoader().getResourceAsStream("images/image-jpg.jpg")) {
            try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
                var inputPath = tempDir.getDirectory().resolve("image-jpg.jpg");
                var outputPath = tempDir.getDirectory().resolve("image-png.png");

                assertThat(jpgImage).isNotNull();
                Files.copy(jpgImage, inputPath);
                assertThat(mimeTypeDetector.detectMimeType(inputPath.toFile())).isEqualTo("image/jpeg");

                imageConverter.convertTo(inputPath, outputPath, "png");
                assertThat(mimeTypeDetector.detectMimeType(outputPath.toFile())).isEqualTo("image/png");
            }
        }
    }

    @Test
    public void test_convertTo_pngToJpg() throws IOException {
        try (var pngImage = this.getClass().getClassLoader().getResourceAsStream("images/image-png.png")) {
            try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
                var inputPath = tempDir.getDirectory().resolve("image-png.png");
                var outputPath = tempDir.getDirectory().resolve("image-jpg.jpg");

                assertThat(pngImage).isNotNull();
                Files.copy(pngImage, inputPath);
                assertThat(mimeTypeDetector.detectMimeType(inputPath.toFile())).isEqualTo("image/png");

                imageConverter.convertTo(inputPath, outputPath, "JPEG");
                assertThat(mimeTypeDetector.detectMimeType(outputPath.toFile())).isEqualTo("image/jpeg");
            }
        }
    }
}
