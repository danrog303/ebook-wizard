package com.github.danrog303.ebookwizard.util.temp;

import lombok.SneakyThrows;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

public class TemporaryDirectoryTest {
    @Test
    @SneakyThrows(IOException.class)
    public void testIfTemporaryDirectoryIsCreatedAndRemoved() {
        Path createdDirectory;

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            createdDirectory = tempDir.getDirectory();
            assertThat(Files.isDirectory(createdDirectory)).isTrue();
        }

        assertThat(Files.isDirectory(createdDirectory)).isFalse();
    }

    @Test
    @SneakyThrows(IOException.class)
    public void testIfTemporaryDirectoryIsWritable() {
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            Path createdDirectory = tempDir.getDirectory();
            Path testFile = Path.of(createdDirectory.toString(), "test.txt");

            Files.createFile(testFile);
            assertThat(Files.isWritable(testFile)).isTrue();
        }
    }
}
