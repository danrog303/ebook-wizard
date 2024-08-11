package com.github.danrog303.ebookwizard.util.string;

import lombok.experimental.UtilityClass;

import java.text.Normalizer;

@UtilityClass
public class StringNormalizer {
    public static String normalize(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutDiacritics = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return withoutDiacritics.replaceAll("\\s+", "-");
    }
}
