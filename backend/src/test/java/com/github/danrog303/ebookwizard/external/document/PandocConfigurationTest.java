package com.github.danrog303.ebookwizard.external.document;

import org.junit.jupiter.api.Test;

import java.io.IOException;

public class PandocConfigurationTest {
    /**
     * Test if the pandoc binary is in the PATH and can be executed.
     * Pandoc is used to process HTML documents, and is required to run some other tests.
     */
    @Test
    public void test_verifyPandocBinaryInPath() throws IOException, InterruptedException {
        var pandocConfiguration = new PandocConfiguration();
        pandocConfiguration.verifyPandocBinaryInPath();
    }
}
