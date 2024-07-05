package com.github.danrog303.ebookwizard.external.mime;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

public interface MimeTypeDetector {
    String detectMimeType(byte[] data) throws IOException;
    String detectMimeType(File filePath) throws IOException;
    String detectMimeType(InputStream inputStream) throws IOException;

}
