package com.github.danrog303.ebookwizard.external.document.b64;

import com.github.danrog303.ebookwizard.external.image.ImageConverter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Allows to extract Base64 images from HTML document.
 * This is useful for displaying large HTML documents (like ebooks) in user browser,
 * as HTMLs with embedded images tends to lag the browser, when images are too big.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class Base64ImagesExtractor {
    private final ImageConverter imageConverter;

    @Data
    @AllArgsConstructor
    public static class ExtractedImage {
        String randomTag;
        Path path;
    }

    @SneakyThrows(IOException.class)
    public List<ExtractedImage> extractBase64Images(Path inputHtmlPath, Path workDirPath) {
        Pattern base64ImagePattern = Pattern.compile("data:image/([^;]+);base64,([a-zA-Z0-9+/=]+)");
        Document doc = Jsoup.parse(inputHtmlPath, "UTF-8");
        List<ExtractedImage> extractedImages = new ArrayList<>();

        doc.select("img").forEach(img -> {
            String src = img.attr("src");
            if (src.startsWith("data:image")) {
                String randomTag = RandomStringUtils.randomAlphanumeric(64);
                Matcher matcher = base64ImagePattern.matcher(src);

                String extensionName;
                String base64Image;
                if (matcher.find()) {
                    extensionName = matcher.group(1).toLowerCase();
                    base64Image = matcher.group(2);
                } else {
                    log.debug("Skipped malformed image from HTML: {}", src);
                    return;
                }

                Path imgPath = workDirPath.resolve(randomTag + "." + extensionName);
                Path imgJpegPath = workDirPath.resolve(randomTag + ".jpg");
                saveImage(base64Image, imgPath);
                saveImageAsJpeg(imgPath, imgJpegPath);

                img.attr("alt", randomTag);
                img.attr("src", randomTag);

                extractedImages.add(new ExtractedImage(randomTag, imgJpegPath));
            }
        });

        Files.write(inputHtmlPath, doc.outerHtml().getBytes());
        return extractedImages;
    }

    @SneakyThrows(IOException.class)
    private void saveImage(String base64Image, Path outputPath) {
        byte[] imageDecoded = Base64.getDecoder().decode(base64Image);
        Files.write(outputPath, imageDecoded);
    }

    @SneakyThrows(IOException.class)
    private void saveImageAsJpeg(Path inputPath, Path outputJpegPath) {
        String inputExtension = inputPath.toString().substring(inputPath.toString().lastIndexOf(".") + 1);
        if (!inputExtension.equalsIgnoreCase("jpg") && !inputExtension.equalsIgnoreCase("jpeg")) {
            imageConverter.convertTo(inputPath, outputJpegPath, "jpg");
        } else {
            Files.copy(inputPath, outputJpegPath);
        }

    }

}
