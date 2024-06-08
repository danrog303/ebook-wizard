package com.github.danrog303.ebookwizard.external.aws;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;

/**
 * Exposes Spring Beans that are necessary to use AWS services.
 */
@Configuration
public class AwsConfig {
    @Value("${amazon.aws.access-key}")
    private String amazonAWSAccessKey;

    @Value("${amazon.aws.secret-key}")
    private String amazonAWSSecretKey;

    @Value("${amazon.aws.region}")
    private String amazonAWSRegionName;

    @Bean
    public Region awsRegion() {
        return Region.of(amazonAWSRegionName);
    }

    @Bean
    public AwsCredentials amazonAwsCredentials() {
        return AwsBasicCredentials.create(amazonAWSAccessKey, amazonAWSSecretKey);
    }

    @Bean
    public AwsCredentialsProvider amazonAwsCredentialsProvider() {
        return StaticCredentialsProvider.create(amazonAwsCredentials());
    }
}