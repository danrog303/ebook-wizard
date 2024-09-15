package com.github.danrog303.ebookwizard.external.storage;

import java.io.File;
import java.io.InputStream;

/**
 * Service for storing and retrieving files from the cloud.
 */
public interface FileStorageService {
    /**
     * Upload a file to the cloud.
     * @param key The name of the file to upload (e.g. S3 file key).
     * @param file The file to upload.
     */
    void uploadFile(String key, File file);

    /**
     * Upload a file to the cloud.
     * @param key The name of the file to upload (e.g. S3 file key).
     * @param dataStream The data to upload.
     * @param contentLength The length of the data.
     */
    void uploadFile(String key, InputStream dataStream, long contentLength);

    /**
     * Return InputStream of the file content.
     * @param key The name of the file to download (e.g. S3 file key).
     */
    InputStream downloadFile(String key);

    /**
     * Delete a file from the cloud.
     * @param key The name of the file to delete (e.g. S3 file key).
     */
    void deleteFile(String key);

    /**
     * Get the download URL for a file.
     * @param key The name of the file to download (e.g. S3 file key).
     */
    String getDownloadUrl(String key);

    /**
     * Get the download URL for a file.
     * @param key The name of the file to download (e.g. S3 file key).
     * @param fileName The name of the file that will be presented to user when they requests download.
     */
    String getDownloadUrl(String key, String fileName);

    /**
     * Get the download URL for a file.
     * The URL will have Content-Disposition header set to "inline".
     * @param key The name of the file to download (e.g. S3 file key).
     */
    String getInlineDownloadUrl(String key);

    /**
     * Get the file size in bytes.
     * @param key The name of the file to download (e.g. S3 file key).
     */
    long getFileSize(String key);
}
