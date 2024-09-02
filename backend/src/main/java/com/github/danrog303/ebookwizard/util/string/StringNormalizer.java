package com.github.danrog303.ebookwizard.util.string;

import lombok.experimental.UtilityClass;

import java.text.Normalizer;

@UtilityClass
public class StringNormalizer {
    public static String normalize(String input) {
        input = input.strip();
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutDiacritics = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // For some reason, Polish "ł" character is not being normalized correctly.
        withoutDiacritics = withoutDiacritics.replaceAll("ł", "l")
                .replaceAll("Ł", "L");

        return withoutDiacritics.replaceAll("\\s+", "-");
    }
}
