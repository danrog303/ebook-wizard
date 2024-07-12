package com.github.danrog303.ebookwizard.external.image;

import java.io.File;
import java.nio.file.Path;

public interface ImageConverter {
    void convertTo(File inputFile, File outputFile, String targetFormat);

    void convertTo(Path inputPath, Path outputPath, String targetFormat);
}
