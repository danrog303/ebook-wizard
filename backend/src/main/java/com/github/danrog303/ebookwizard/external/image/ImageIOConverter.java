package com.github.danrog303.ebookwizard.external.image;

import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
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
        BufferedImage originalImage = ImageIO.read(inputFile);
        BufferedImage newImage = new BufferedImage(originalImage.getWidth(), originalImage.getHeight(), BufferedImage.TYPE_INT_RGB);

        newImage.createGraphics().drawImage(originalImage, 0, 0, Color.WHITE, null);

        ImageIO.write(newImage, targetFormat, outputFile);
    }

    @Override
    public void convertTo(Path inputPath, Path outputPath, String targetFormat) {
        convertTo(inputPath.toFile(), outputPath.toFile(), targetFormat);
    }
}
