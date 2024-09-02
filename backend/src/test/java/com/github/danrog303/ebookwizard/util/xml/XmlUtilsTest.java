package com.github.danrog303.ebookwizard.util.xml;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.xpath.XPathExpressionException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class XmlUtilsTest {
    /**
     * Sample XML content for use in the tests.
     */
    private static final String SAMPLE_XML = """
            <?xml version="1.0" encoding="UTF-8"?>
            <root xmlns:dc="http://purl.org/dc/elements/1.1/">
                <dc:title>Sample Title</dc:title>
                <dc:creator>Author Name</dc:creator>
            </root>
            """;

    /**
     * Invalid XML content for use in the tests.
     */
    private static final String INVALID_XML = """
            <root><dc:title>Sample Title<dc:title></root>
            """;

    private Document document;

    /**
     * Set up a valid document for use in the tests.
     */
    @BeforeEach
    void setUp() {
        document = XmlUtils.loadXmlContent(SAMPLE_XML);
    }

    /**
     * Test that loading XML content works correctly.
     */
    @Test
    void test_loadXmlContent_validXml() {
        Document doc = XmlUtils.loadXmlContent(SAMPLE_XML);
        assertNotNull(doc);
        assertEquals("root", doc.getDocumentElement().getTagName());
    }

    /**
     * Test that loading invalid XML throws an exception.
     */
    @Test
    void test_loadXmlContent_invalidXml() {
        assertThrows(SAXException.class, () -> XmlUtils.loadXmlContent(INVALID_XML));
    }

    /**
     * Test that loading XML contents from file does work.
     */
    @Test
    void test_loadXmlFile(@TempDir Path tempDir) throws IOException {
        // Create a temporary XML file for testing
        Path tempFile = tempDir.resolve("test.xml");
        Files.write(tempFile, SAMPLE_XML.getBytes());

        // Test that loading XML from a file works correctly
        Document doc = XmlUtils.loadXmlFile(tempFile);
        assertNotNull(doc);
        assertEquals("root", doc.getDocumentElement().getTagName());
    }

    /**
     * Test that loading XML from an invalid file path throws an exception.
     */
    @Test
    void test_loadXmlFile_invalidPath() {
        Path invalidPath = Path.of("non_existent_file.xml");
        assertThrows(IOException.class, () -> XmlUtils.loadXmlFile(invalidPath));
    }

    /**
     * Test that executing an XPath query works correctly.
     */
    @Test
    void test_executeXpathQuery_validQuery() throws XPathExpressionException {
        // Test executing a valid XPath query
        NodeList nodes = XmlUtils.executeXpathQuery(document, "//dc:title");
        assertNotNull(nodes);
        assertEquals(1, nodes.getLength());
        assertEquals("Sample Title", nodes.item(0).getTextContent());
    }

    /**
     * Test that executing an invalid XPath query throws an exception.
     */
    @Test
    void test_executeXpathQuery_invalidQuery() {
        assertThrows(XPathExpressionException.class, () -> XmlUtils.executeXpathQuery(document, "//*invalid_xpath"));
    }

    /**
     * Test that executing an XPath query with no results works correctly.
     */
    @Test
    void test_executeXpathQuery_withNoResults() throws XPathExpressionException {
        NodeList nodes = XmlUtils.executeXpathQuery(document, "//non_existent_element");
        assertNotNull(nodes);
        assertEquals(0, nodes.getLength());
    }

    /**
     * Test that executing an XPath query with namespaces works correctly.
     */
    @Test
    void test_executeXpathQuery_withNamespaces() throws XPathExpressionException {
        NodeList nodes = XmlUtils.executeXpathQuery(document, "//dc:creator");
        assertNotNull(nodes);
        assertEquals(1, nodes.getLength());
        assertEquals("Author Name", nodes.item(0).getTextContent());
    }

    /**
     * Test that providing null input to the methods throws an exception.
     */
    @Test
    void test_loadXmlContent_nullInput() {
        assertThrows(NullPointerException.class, () -> XmlUtils.loadXmlContent(null));
    }

    /**
     * Test that providing null input to the methods throws an exception.
     */
    @Test
    void test_loadXmlFile_nullInput() {
        assertThrows(NullPointerException.class, () -> XmlUtils.loadXmlFile(null));
    }

    /**
     * Test that providing null input to the methods throws an exception.
     */
    @Test
    void test_executeXpathQuery_nullDocument() {
        assertThrows(NullPointerException.class, () -> XmlUtils.executeXpathQuery(null, "//dc:title"));
    }

    /**
     * Test that providing null input to the methods throws an exception.
     */
    @Test
    void test_executeXpathQuery_nullQuery() {
        assertThrows(NullPointerException.class, () -> XmlUtils.executeXpathQuery(document, null));
    }
}
