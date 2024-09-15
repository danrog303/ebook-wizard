package com.github.danrog303.ebookwizard.external.document.converter;

import com.github.danrog303.ebookwizard.domain.ebook.models.EbookFormat;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

/**
 * Uses the ebook-convert binary from Calibre project
 * to convert documents between supported formats (e.g. EPUB, MOBI, PDF).
 */
@Slf4j
@Service
public class CalibreDocumentConverter implements DocumentConverter {
    @SneakyThrows({IOException.class})
    public void convertDocument(Path documentInputPath, Path documentOutputPath) {
        boolean isHtmlConversion = documentInputPath.toString().endsWith(".html") || documentOutputPath.toString().endsWith(".html");

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            if (isHtmlConversion) {
                runPandocConversion(tempDir, documentInputPath, documentOutputPath);
            } else {
                runCalibreConversion(tempDir, documentInputPath, documentOutputPath);
            }
        }
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

    @SneakyThrows({IOException.class, InterruptedException.class})
    private void runCalibreConversion(TemporaryDirectory tempDir, Path documentInputPath, Path documentOutputPath) {
        log.debug("Converting {} to {}", documentInputPath.toString(), documentOutputPath.toString());

        String[] command = {"ebook-convert", documentInputPath.toString(), documentOutputPath.toString()};
        Process process = Runtime.getRuntime().exec(command);
        process.waitFor();

        if (process.exitValue() != 0) {
            throw new RuntimeException("Failed to convert document file");
        }

        process.destroy();
    }

    /**
     * Fallback to pandoc conversion.
     * Pandoc is used for HTML conversion, as Calibre supports only HTMLZ format.
     */
    @SneakyThrows({IOException.class, InterruptedException.class})
    private void runPandocConversion(TemporaryDirectory tempDir, Path documentInputPath, Path documentOutputPath) {
        log.debug("Falling back to pandoc to convert {} to HTML", documentInputPath.toString());

        // Pandoc does not support most ebook formats, so we need to convert input to EPUB first
        Path pandocInputPath = tempDir.getDirectory().resolve("input_epub.epub");
        if (documentInputPath.endsWith(".epub") || documentInputPath.endsWith(".html")) {
            pandocInputPath = documentInputPath;
        } else {
            runCalibreConversion(tempDir, documentInputPath, pandocInputPath);
        }

        Path pandocOutputPath;
        if (documentOutputPath.toString().endsWith(".epub") || documentOutputPath.toString().endsWith(".html")) {
            pandocOutputPath = documentOutputPath;
        } else {
            pandocOutputPath = tempDir.getDirectory().resolve("output_epub.epub");
        }

        String[] command = {"pandoc", "--standalone", "--self-contained", "--embed-resources", "--toc", pandocInputPath.toString(), "-o", pandocOutputPath.toString()};
        Process process = Runtime.getRuntime().exec(command);
        process.waitFor();
        if (process.exitValue() != 0) {
            throw new RuntimeException("Failed to convert document file");
        }
        process.destroy();

        if (!pandocOutputPath.equals(documentOutputPath)) {
            runCalibreConversion(tempDir, pandocOutputPath, documentOutputPath);
        }

        if (documentOutputPath.toString().endsWith(".html")) {
            Path tempWorkingFile = tempDir.getDirectory().resolve("temp_fix.html");
            fixPandocHtml(documentOutputPath, tempWorkingFile);
        }
    }

    @SneakyThrows({IOException.class})
    private void fixPandocHtml(Path htmlInputPath, Path tempOutputPath) {
        log.debug("Fixing pandoc HTML output: {}", htmlInputPath.toString());

        try (BufferedReader reader = new BufferedReader(new FileReader(htmlInputPath.toFile()));
             BufferedWriter writer = new BufferedWriter(new FileWriter(tempOutputPath.toFile()))) {

            String svgPattern = "<svg xmlns=\".*\".* viewbox.*>";

            String line;
            boolean isSvgLine = false;

            while ((line = reader.readLine()) != null) {
                // Check if the line starts an SVG block
                if (line.matches(svgPattern)) {
                    log.debug("Found invalid SVG during fixing pandoc HTML: {}", htmlInputPath);
                    isSvgLine = true;
                }

                if (!isSvgLine) {
                    // Write the line to the output file if it's not part of the SVG block
                    writer.write(line);
                    writer.newLine();
                }

                // Check if the line ends the SVG block
                if (line.contains("</svg>")) {
                    isSvgLine = false;
                }
            }
        }

        Files.copy(tempOutputPath, htmlInputPath, StandardCopyOption.REPLACE_EXISTING);
    }
}
