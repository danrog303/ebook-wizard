package com.github.danrog303.ebookwizard.external.tts;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.polly.PollyClient;
import software.amazon.awssdk.services.polly.model.*;

import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmazonPollyTextToSpeechService implements TextToSpeechService {
    @Value("${spring.cloud.aws.credentials.access-key}") private String awsAccessKey;
    @Value("${spring.cloud.aws.credentials.secret-key}") private String awsSecretKey;
    @Value("${spring.cloud.aws.region.static}") private String awsRegion;

    @Value("${ebook-wizard.tts.polly.engine}") private String amazonPollyEngine;

    private PollyClient pollyClient;

    @PostConstruct
    public void init() {
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(awsAccessKey, awsSecretKey);
        this.pollyClient = PollyClient.builder()
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .region(Region.of(awsRegion))
                .build();
    }

    @Override
    public InputStream synthesizeSpeech(String voiceName, String text) {
        SynthesizeSpeechRequest request = SynthesizeSpeechRequest.builder()
                .text(text)
                .voiceId(voiceName)
                .engine(amazonPollyEngine)
                .outputFormat(OutputFormat.OGG_VORBIS)
                .build();

        return pollyClient.synthesizeSpeech(request);
    }

    @Override
    public List<String> getSupportedLanguageCodes() {
        DescribeVoicesRequest request = DescribeVoicesRequest.builder().build();
        DescribeVoicesResponse response = pollyClient.describeVoices(request);

        return response.voices().stream()
                .map(Voice::languageCodeAsString)
                .distinct()
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getVoiceNamesForLanguageCode(String languageCode) {
        DescribeVoicesRequest request = DescribeVoicesRequest.builder()
                .languageCode(languageCode)
                .engine(amazonPollyEngine)
                .build();
        DescribeVoicesResponse response = pollyClient.describeVoices(request);

        return response.voices().stream()
                .map(Voice::name)
                .collect(Collectors.toList());
    }
}
