package com.github.danrog303.ebookwizard.external.document;

import jakarta.annotation.PostConstruct;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Slf4j
@Configuration
public class CalibreConfiguration {
    /**
     * Verify that the ebook-convert binary is in the PATH and can be executed.
     * Should run once when the application starts.
     */
    @PostConstruct
    public void verifyEbookConvertBinaryInPath() {
        log.info("Verify that ebook-convert binary is in the PATH and can be executed");
        var cmd = new String[] {"ebook-convert", "--version"};
        assertCommandZeroExitCode(cmd);
    }

    /**
     * Verify that the ebook-meta binary is in the PATH and can be executed.
     * Should run once when the application starts.
     */
    @PostConstruct
    public void verifyEbookMetaBinaryInPath() {
        log.info("Verify that ebook-meta binary is in the PATH and can be executed");
        var cmd = new String[] {"ebook-meta", "--version"};
        assertCommandZeroExitCode(cmd);
    }

    @SneakyThrows({IOException.class, InterruptedException.class})
    private void assertCommandZeroExitCode(String[] command) {
        Runtime runtime = Runtime.getRuntime();
        Process process = runtime.exec(command);
        process.waitFor();

        if (process.exitValue() != 0) {
            log.error("Failed to check ebook-convert binary");
            throw new AssertionError("Failed to check ebook-convert binary");
        }

        process.destroy();

    }
}
