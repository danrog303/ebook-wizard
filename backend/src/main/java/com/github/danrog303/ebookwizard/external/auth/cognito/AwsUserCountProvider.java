package com.github.danrog303.ebookwizard.external.auth.cognito;

import com.github.danrog303.ebookwizard.external.auth.UserCountProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.DescribeUserPoolRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.DescribeUserPoolResponse;

@Service
@RequiredArgsConstructor
public class AwsUserCountProvider implements UserCountProvider {
    private final CognitoIdentityProviderClient cognitoClient;

    @Value("${amazon.aws.cognito.pool-id}")
    private String cognitoUserPoolId;

    public long getUserCount() {
        DescribeUserPoolRequest describeRequest = DescribeUserPoolRequest.builder()
                .userPoolId(cognitoUserPoolId)
                .build();

        DescribeUserPoolResponse describeResponse = cognitoClient.describeUserPool(describeRequest);
        return describeResponse.userPool().estimatedNumberOfUsers();
    }
}
