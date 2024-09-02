package com.github.danrog303.ebookwizard.external.document;

import org.junit.jupiter.api.Test;

public class CalibreConfigurationTest {
    /**
     * Test if the ebook-convert binary is in the PATH and can be executed.
     * This binary is provided by Calibre project and is used to convert ebook files.
     * It is required to run some other tests.
     */
    @Test
    public void test_verifyEbookMetaBinaryInPath() {
        var calibreConfiguration = new CalibreConfiguration();
        calibreConfiguration.verifyEbookMetaBinaryInPath();
    }

    /**
     * Test if the ebook-convert binary is in the PATH and can be executed.
     * This binary is provided by Calibre project and is used to convert ebook files.
     * It is required to run some other tests.
     */
    @Test
    public void test_verifyEbookConvertBinaryInPath() {
        var calibreConfiguration = new CalibreConfiguration();
        calibreConfiguration.verifyEbookConvertBinaryInPath();
    }
}
