package com.github.danrog303.ebookwizard.domain.taskqueue.common;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class QueueTaskConfig {
    private final String conversionQueueUrl;

    private final String emailQueueUrl;

    public QueueTaskConfig(@Value("${ebook-wizard.queue.sqs.conversion-queue-url}") String conversionQueueUrl,
                           @Value("${ebook-wizard.queue.sqs.email-queue-url}") String emailQueueUrl) {
        this.conversionQueueUrl = conversionQueueUrl;
        this.emailQueueUrl = emailQueueUrl;
    }
}
