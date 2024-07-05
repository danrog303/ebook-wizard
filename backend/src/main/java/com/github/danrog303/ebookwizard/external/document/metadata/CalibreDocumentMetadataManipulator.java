package com.github.danrog303.ebookwizard.external.document.metadata;

import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import com.github.danrog303.ebookwizard.util.xml.XmlUtils;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CalibreDocumentMetadataManipulator implements DocumentMetadataManipulator {
    @SneakyThrows({IOException.class, InterruptedException.class})
    private Document getOpfFileFromDocument(Path documentPath) {
        var runtime = Runtime.getRuntime();

        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            var opfFilePath = Path.of(tempDir.getDirectory().toAbsolutePath().toString(), "out.opf");

            String[] command = {
                    "ebook-meta",
                    "--to-opf",
                    opfFilePath.toString(),
                    documentPath.toAbsolutePath().toString()
            };

            Process process = runtime.exec(command);
            process.waitFor();

            return XmlUtils.loadXmlFile(opfFilePath);
        }
    }

    @Override
    public DocumentMetadata getDocumentMetadata(Path documentPath) {
        log.debug("Getting metadata of document file: {}", documentPath.getFileName().toString());
        var meta = new DocumentMetadata();
        var opfDocument = getOpfFileFromDocument(documentPath);

        meta.setTags(new ArrayList<>());
        var subjectTags = XmlUtils.executeXpathQuery(opfDocument, "/opf:package/opf:metadata/dc:subject");
        for (int i = 0; i < subjectTags.getLength(); i++) {
            meta.getTags().add(subjectTags.item(i).getTextContent());
        }

        var titleTags = XmlUtils.executeXpathQuery(opfDocument, "/opf:package/opf:metadata/dc:title");
        if (titleTags.getLength() > 0) {
            meta.setName(titleTags.item(0).getTextContent());
        }

        var authorTags = XmlUtils.executeXpathQuery(opfDocument, "/opf:package/opf:metadata/dc:creator");
        if (authorTags.getLength() > 0) {
            meta.setAuthor(authorTags.item(0).getTextContent());
        }

        var descriptionTags = XmlUtils.executeXpathQuery(opfDocument, "/opf:package/opf:metadata/dc:description");
        if (descriptionTags.getLength() > 0) {
            meta.setDescription(descriptionTags.item(0).getTextContent());
        }

        return meta;
    }

    @Override
    @SneakyThrows({IOException.class, InterruptedException.class})
    public void setDocumentMetadata(Path documentPath, DocumentMetadata documentMetadata) {
        log.debug("Setting metadata of document file: {}", documentPath.getFileName().toString());
        if (documentMetadata == null || documentMetadata.isEmpty()) {
            log.debug("Setting metadata skipped (no metadata to write)");
            return;
        }

        List<String> command = new ArrayList<>();
        command.add("ebook-meta");

        if (documentMetadata.getName() != null && !documentMetadata.getName().isEmpty()) {
            command.add("--title");
            command.add(documentMetadata.getName());
        }

        if (documentMetadata.getAuthor() != null && !documentMetadata.getAuthor().isEmpty()) {
            command.add("--authors");
            command.add(documentMetadata.getAuthor());
        }

        if (documentMetadata.getDescription() != null && !documentMetadata.getDescription().isEmpty()) {
            command.add("--comments");
            command.add(documentMetadata.getDescription());
        }

        if (documentMetadata.getTags() != null && !documentMetadata.getTags().isEmpty()) {
            command.add("--tags");
            command.add(String.join(",", documentMetadata.getTags()));
        }

        command.add(documentPath.toAbsolutePath().toString());
        log.debug("Using command to set metadata: {}", command);

        var runtime = Runtime.getRuntime();
        Process process = runtime.exec(command.toArray(new String[0]));
        process.waitFor();

        if (process.exitValue() != 0) {
            throw new RuntimeException("Failed to set metadata of document file");
        }

        process.destroy();
    }
}
