package com.github.danrog303.ebookwizard.external.document.converter;

import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Uses the ebook-convert binary from Calibre project
 * to convert documents between supported formats (e.g. EPUB, MOBI, PDF).
 */
@Slf4j
@Service
public class CalibreDocumentConverter implements DocumentConverter {
    @SneakyThrows({IOException.class, InterruptedException.class})
    public void convertDocument(Path documentInputPath, Path documentOutputPath) {
        Runtime runtime = Runtime.getRuntime();
        String[] command = {"ebook-convert", documentInputPath.toString(), documentOutputPath.toString()};
        Process process = runtime.exec(command);
        process.waitFor();

        if (process.exitValue() != 0) {
            throw new RuntimeException("Failed to convert document file");
        }

        process.destroy();
    }

    public void convertDocument(InputStream inputStream, OutputStream outputStream,
                                 EbookFormat inputFormat, EbookFormat outputFormat) {
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            var absPath = tempDir.getDirectory().toAbsolutePath().toString();
            Path inputFilePath = Path.of(absPath, "input" + inputFormat.getExtensionName());
            Path outputFilePath = Path.of(absPath, "output" + outputFormat.getExtensionName());

            Files.copy(inputStream, inputFilePath);
            convertDocument(inputFilePath, outputFilePath);
            Files.copy(outputFilePath, outputStream);
        } catch (IOException e) {
            throw new RuntimeException("Failed to convert document", e);
        }
    }
}
