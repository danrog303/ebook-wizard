package com.github.danrog303.ebookwizard.external.document.thumbnail;

import java.nio.file.Path;

public interface DocumentThumbnailManipulator {
    void extractThumbnail(Path documentInputPath, Path thumbnailOutputPath);
    void setThumbnail(Path documentPath, Path thumbnailPath);
}
