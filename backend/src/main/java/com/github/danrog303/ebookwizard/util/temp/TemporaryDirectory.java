package com.github.danrog303.ebookwizard.util.temp;

import lombok.Getter;
import org.apache.commons.lang3.RandomStringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.util.Objects;

/**
 * Offers an AutoCloseable temporary directory that is automatically
 * deleted when instance of object is closed.
 */
@Getter
public class TemporaryDirectory implements AutoCloseable {
    private final Path directory;

    public TemporaryDirectory() throws IOException {
        var randomTag = RandomStringUtils.random(20, 0, 0, true, true, null, new SecureRandom());
        this.directory = Files.createTempDirectory(randomTag);
    }

    @Override
    public void close() throws IOException {
        deleteRecursively(directory.toFile());
    }

    private void deleteRecursively(File file) throws IOException {
        if (file.isDirectory()) {
            for (File child : Objects.requireNonNull(file.listFiles())) {
                deleteRecursively(child);
            }
        }
        Files.delete(file.toPath());
    }
}