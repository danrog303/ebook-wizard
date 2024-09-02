package com.github.danrog303.ebookwizard.external.document;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;

@Slf4j
public class PandocConfiguration {
    /**
     * Verify that the pandoc binary is in the PATH and can be executed.
     * Should run once when the application starts.
     */
    @PostConstruct
    public void verifyPandocBinaryInPath() throws IOException, InterruptedException {
        log.info("Verify that pandoc binary is in the PATH and can be executed");
        Runtime runtime = Runtime.getRuntime();
        Process process = runtime.exec(new String[] {"pandoc", "--version"});
        process.waitFor();

        if (process.exitValue() != 0) {
            log.error("Failed to check pandoc binary");
            throw new AssertionError("Failed to check pandoc binary");
        }

        process.destroy();
    }
}
