package com.github.danrog303.ebookwizard.external.image;

import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

@Service
public class ImageIOConverter implements ImageConverter {
    static {
        ImageIO.scanForPlugins();
    }

    @Override
    @SneakyThrows({IOException.class})
    public void convertTo(File inputFile, File outputFile, String targetFormat) {
        BufferedImage image = ImageIO.read(inputFile);
        ImageIO.write(image, targetFormat, outputFile);
    }

    @Override
    public void convertTo(Path inputPath, Path outputPath, String targetFormat) {
        convertTo(inputPath.toFile(), outputPath.toFile(), targetFormat);
    }
}
