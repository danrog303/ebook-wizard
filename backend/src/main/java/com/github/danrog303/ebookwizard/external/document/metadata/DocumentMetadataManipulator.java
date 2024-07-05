package com.github.danrog303.ebookwizard.external.document.metadata;

import java.nio.file.Path;

public interface DocumentMetadataManipulator {
    DocumentMetadata getDocumentMetadata(Path documentPath);
    void setDocumentMetadata(Path documentPath, DocumentMetadata documentMetadata);
}
