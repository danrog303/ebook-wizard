package com.github.danrog303.ebookwizard.external.document.thumbnail;

import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Uses Calibre's ebook-meta binary
 * to extract thumbnail (cover image) from given document/
 */
@Slf4j
@Service
public class CalibreDocumentThumbnailManipulator implements DocumentThumbnailManipulator {
    /**
     * Tries to extract a thumbnail from the given document file.
     * If it is not possible (e.g. txt file passed), it will output a generic fallback cover image.
     * @param documentInputPath Path to the document file (e.g. EPUB, MOBI, PDF)
     * @param thumbnailOutputPath Path where extracted thumbnail should be saved
     */
    @SneakyThrows({IOException.class, InterruptedException.class})
    public void extractThumbnail(Path documentInputPath, Path thumbnailOutputPath) {
        log.debug("Trying to obtain thumbnail image of {}", documentInputPath.getFileName().toString());
        Files.deleteIfExists(thumbnailOutputPath);

        Runtime runtime = Runtime.getRuntime();
        String[] command = {
            "ebook-meta",
            "--get-cover",
            thumbnailOutputPath.toAbsolutePath().toString(),
            documentInputPath.toAbsolutePath().toString()
        };

        Process process = runtime.exec(command);
        process.waitFor();

        // If process could not extract thumbnail, fallback to a generic cover image
        if (process.exitValue() != 0 || Files.notExists(thumbnailOutputPath)) {
            saveFallbackImageToPath(thumbnailOutputPath);
        }

        process.destroy();
    }

    /**
     * Changes the thumbnail image of the given document.
     * If it is not possible (e.g. txt file passed), it will simply do nothing.
     * @param documentPath Path to the document file
     * @param thumbnailPath Path to the new thumbnail image
     */
    @SneakyThrows({IOException.class, InterruptedException.class})
    public void setThumbnail(Path documentPath, Path thumbnailPath) {
        log.debug("Changing thumbnail image of {}", documentPath.getFileName().toString());

        Runtime runtime = Runtime.getRuntime();
        String[] command = {
            "ebook-meta",
            "--cover",
            thumbnailPath.toAbsolutePath().toString(),
            documentPath.toAbsolutePath().toString()
        };

        Process process = runtime.exec(command);
        process.waitFor();
    }

    @SneakyThrows(IOException.class)
    private void saveFallbackImageToPath(Path outputPath) {
        var loader = CalibreDocumentThumbnailManipulator.class.getClassLoader();
        try (var resource = loader.getResourceAsStream("fallback/fallback-cover-image.jpg")) {
            assert resource != null;
            Files.copy(resource, outputPath);
        }
    }
}
