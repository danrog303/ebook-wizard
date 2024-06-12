package com.github.danrog303.ebookwizard.external.auth.cognito;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;

/**
 * Exposes Spring Beans related to Amazon Cognito service.
 */
@Configuration
@RequiredArgsConstructor
public class AwsCognitoConfig {
    @Value("${spring.cloud.aws.region.static}")
    private String awsRegion;

    /**
     * Instance of Amazon Cognito client.
     */
    @Bean
    public CognitoIdentityProviderClient cognitoIdentityProviderClient() {
        return CognitoIdentityProviderClient.builder()
                .region(Region.of(awsRegion))
                .build();
    }
}
