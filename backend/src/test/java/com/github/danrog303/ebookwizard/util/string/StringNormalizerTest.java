package com.github.danrog303.ebookwizard.util.string;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class StringNormalizerTest {

    /**
     * Test normalizing a string with diacritical marks.
     */
    @Test
    void test_normalize_withDiacritics() {
        String input = "Zażółć Gęślą Jaźń";
        String expected = "Zazolc-Gesla-Jazn";
        String result = StringNormalizer.normalize(input);
        assertEquals(expected, result);
    }

    /**
     * Test normalizing a string with multiple spaces.
     */
    @Test
    void test_normalize_withMultipleSpaces() {
        String input = "Hello   World";
        String expected = "Hello-World";
        String result = StringNormalizer.normalize(input);
        assertEquals(expected, result);
    }

    /**
     * Test normalizing a string with special characters.
     */
    @Test
    void test_normalize_withSpecialCharacters() {
        String input = "Hello, World!";
        String expected = "Hello,-World!";
        String result = StringNormalizer.normalize(input);
        assertEquals(expected, result);
    }

    /**
     * Test normalizing an empty string.
     */
    @Test
    void test_normalize_withEmptyString() {
        String input = "";
        String expected = "";
        String result = StringNormalizer.normalize(input);
        assertEquals(expected, result);
    }

    /**
     * Test normalizing a null input.
     */
    @Test
    void test_normalize_withNullInput() {
        assertThrows(NullPointerException.class, () -> StringNormalizer.normalize(null));
    }

    /**
     * Test normalizing a string with no diacritical marks.
     */
    @Test
    void test_normalize_withNoDiacritics() {
        String input = "Hello World";
        String expected = "Hello-World";
        String result = StringNormalizer.normalize(input);
        assertEquals(expected, result);
    }

    /**
     * Test normalizing a string with tabs and newlines.
     */
    @Test
    void test_normalize_withTabsAndNewlines() {
        String input = "Hello\tWorld\nNew Line";
        String expected = "Hello-World-New-Line";
        String result = StringNormalizer.normalize(input);
        assertEquals(expected, result);
    }

    /**
     * Test normalizing a string with leading and trailing spaces.
     */
    @Test
    void test_normalize_withLeadingAndTrailingSpaces() {
        String input = "  Hello World  ";
        String expected = "Hello-World";
        String result = StringNormalizer.normalize(input);
        assertEquals(expected, result);
    }

    /**
     * Test normalizing a string with only combining diacritical marks.
     */
    @Test
    void test_normalize_withCombiningMarksOnly() {
        String input = "a\u0301 e\u0301 i\u0301 o\u0301 u\u0301";
        String expected = "a-e-i-o-u";
        String result = StringNormalizer.normalize(input);
        assertEquals(expected, result);
    }
}
