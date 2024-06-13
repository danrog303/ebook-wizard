package com.github.danrog303.ebookwizard.external.storage;

import java.io.File;
import java.io.InputStream;
import java.util.stream.Stream;

public interface FileStorageService {
    void uploadFile(String key, File file);
    InputStream downloadFile(String key);
    void deleteFile(String key);
    String getDownloadUrl(String key);
}
