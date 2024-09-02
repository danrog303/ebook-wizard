package com.github.danrog303.ebookwizard.util.xml;

import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.*;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Objects;

@UtilityClass
public class XmlUtils {
    private final DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
    private final XPathFactory xPathfactory = XPathFactory.newInstance();

    static {
        factory.setNamespaceAware(true);
    }

    private final NamespaceContext nsContext = new NamespaceContext() {
        @Override
        public String getNamespaceURI(String prefix) {
            return switch (prefix) {
                case "dc" -> "http://purl.org/dc/elements/1.1/";
                case "opf" -> "http://www.idpf.org/2007/opf";
                case "calibre" -> "http://calibre.kovidgoyal.net/2009/metadata";
                default -> null;
            };
        }

        @Override
        public String getPrefix(String namespaceURI) {
            return null;
        }

        @Override
        public Iterator<String> getPrefixes(String namespaceURI) {
            return null;
        }
    };


    @SneakyThrows({ParserConfigurationException.class, SAXException.class, IOException.class})
    public static Document loadXmlContent(String xmlCode) {
        InputStream inputStream = new ByteArrayInputStream(xmlCode.getBytes(StandardCharsets.UTF_8));
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(inputStream);
    }

    @SneakyThrows({ParserConfigurationException.class, SAXException.class, IOException.class})
    public static Document loadXmlFile(Path filePath) {
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(Files.newInputStream(filePath));
    }

    @SneakyThrows(XPathException.class)
    public static NodeList executeXpathQuery(Document document, String xpathQuery) {
        Objects.requireNonNull(document, xpathQuery);
        XPath xpath = xPathfactory.newXPath();
        xpath.setNamespaceContext(nsContext);
        XPathExpression expr = xpath.compile(xpathQuery);
        return (NodeList) expr.evaluate(document, XPathConstants.NODESET);
    }
}
