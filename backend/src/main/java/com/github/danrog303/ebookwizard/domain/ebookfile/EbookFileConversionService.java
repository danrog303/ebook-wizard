package com.github.danrog303.ebookwizard.domain.ebookfile;

import com.github.danrog303.ebookwizard.domain.ebook.EbookFormat;
import jakarta.annotation.PostConstruct;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Path;

/**
 * Uses ebook-convert binary to convert ebook files between supported formats.
 */
@Slf4j
@Service
public class EbookFileConversionService {
    @SneakyThrows({IOException.class, InterruptedException.class})
    public void convertEbookFile(Path ebookFilePath, Path outputFilePath) {
        Runtime runtime = Runtime.getRuntime();
        String[] command = {"ebook-convert", ebookFilePath.toString(), outputFilePath.toString()};
        Process process = runtime.exec(command);
        process.waitFor();

        if (process.exitValue() != 0) {
            throw new RuntimeException("Failed to convert ebook file");
        }

        process.destroy();
    }

    public void convertEbookFile(InputStream ebookFileInputStream, OutputStream outputStream,
                                 EbookFormat inputFormat, EbookFormat outputFormat) {

    }

    /**
     * Verify that the ebook-convert binary is in the PATH and can be executed.
     * Should run once when the application starts.
     */
    @PostConstruct
    @SneakyThrows({IOException.class, InterruptedException.class})
    public void verifyEbookConvertBinaryInPath() {
        log.info("Verify that ebook-convert binary is in the PATH and can be executed");
        Runtime runtime = Runtime.getRuntime();
        String[] command = {"ebook-convert", "--version"};
        Process process = runtime.exec(command);
        process.waitFor();

        if (process.exitValue() != 0) {
            log.error("Failed to check ebook-convert binary");
            throw new RuntimeException("Failed to check ebook-convert binary");
        }

        process.destroy();
    }
}
