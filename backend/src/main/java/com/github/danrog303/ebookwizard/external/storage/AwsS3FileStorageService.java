package com.github.danrog303.ebookwizard.external.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.File;
import java.io.InputStream;
import java.net.URLConnection;
import java.time.Duration;

/**
 * Service for storing and retrieving files from AWS S3.
 * Implements the FileStorageService interface.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AwsS3FileStorageService implements FileStorageService {
    private final S3Client s3Client;

    @Value("${amazon.aws.s3.bucket-name}")
    private String bucketName;

    @Override
    public void uploadFile(String key, File file) {
        log.debug("Uploading file to S3: {}", key);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromFile(file));
    }

    @Override
    public void uploadFile(String key, InputStream dataStream, long contentLength) {
        log.debug("Uploading file to S3: {}", key);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(dataStream, contentLength));
    }

    @Override
    public InputStream downloadFile(String key) {
        log.debug("Downloading file from S3: {}", key);

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        return s3Client.getObject(getObjectRequest);
    }

    @Override
    public void deleteFile(String key) {
        log.debug("Deleting file from S3: {}", key);

        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.deleteObject(deleteObjectRequest);
    }

    @Override
    public String getDownloadUrl(String key) {
        log.debug("Generating download URL for file: {}", key);

        try (S3Presigner presigner = S3Presigner.create()) {

            GetObjectRequest objectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(60))
                    .getObjectRequest(objectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toExternalForm();
        }
    }

    @Override
    public String getDownloadUrl(String key, String targetFileName) {
        log.debug("Generating download URL for file: {}", key);

        try (S3Presigner presigner = S3Presigner.create()) {

            GetObjectRequest objectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .responseContentDisposition("attachment; filename=\"" + targetFileName + "\"")
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(60))
                    .getObjectRequest(objectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toExternalForm();
        }
    }

    @Override
    public String getInlineDownloadUrl(String key) {
        log.debug("Generating inline download URL for file: {}", key);

        String extension = key.substring(key.lastIndexOf('.') + 1);
        String mime = URLConnection.getFileNameMap().getContentTypeFor("out." + extension);

        try (S3Presigner presigner = S3Presigner.create()) {

            GetObjectRequest objectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .responseContentDisposition("inline")
                    .responseContentType(mime)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(60))
                    .getObjectRequest(objectRequest)
                    .build();

            PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
            return presignedRequest.url().toExternalForm();
        }
    }

    @Override
    public long getFileSize(String key) {
        log.debug("Getting file size for file: {}", key);

        HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        HeadObjectResponse headObjectResponse = s3Client.headObject(headObjectRequest);
        return headObjectResponse.contentLength();
    }
}
