package com.github.danrog303.ebookwizard.domain.taskqueue.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.danrog303.ebookwizard.domain.taskqueue.common.*;
import com.github.danrog303.ebookwizard.external.email.EmailSenderService;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailQueueService {
    private final QueueTaskConfig queueTaskConfig;
    private final QueueTaskService queueTaskService;
    private final EmailSenderService emailService;
    private final ObjectMapper objectMapper;

    public QueueTask<QueueTaskPayload> enqueueEmail(EmailQueueTaskPayload emailQueueTaskPayload) {
        String emailQueueUrl = this.queueTaskConfig.getEmailQueueUrl();
        return this.queueTaskService.enqueueTask(emailQueueUrl, emailQueueTaskPayload);
    }

    @SqsListener(value="${ebook-wizard.queue.sqs.email-queue-url}", maxConcurrentMessages="2", maxMessagesPerPoll="2")
    public void processEmailQueue(String payloadJson) {
        EmailQueueTaskPayload queueTaskPayload = null;
        try {
            log.debug("Unmarshalling email task payload: {}", payloadJson);
            queueTaskPayload = this.objectMapper.readValue(payloadJson, EmailQueueTaskPayload.class);
            log.debug("Processing email task: {}", queueTaskPayload.getTaskId());

            Thread.sleep(5000);
            this.queueTaskService.updateTaskStatus(queueTaskPayload.getTaskId(), QueueTaskStatus.IN_PROGRESS);
            this.emailService.send(queueTaskPayload.getTo(), queueTaskPayload.getSubject(), queueTaskPayload.getContentHtml());
            this.queueTaskService.updateTaskStatus(queueTaskPayload.getTaskId(), QueueTaskStatus.COMPLETED);
            log.debug("Processing email task completed: {}", queueTaskPayload.getTaskId());
        } catch (Exception e) {
            if (queueTaskPayload == null) {
                log.error("Failed to unmarshal email task payload: {}", payloadJson);
            } else {
                log.error("Processing email task failed: {}", queueTaskPayload.getTaskId());
                this.queueTaskService.updateTaskStatus(queueTaskPayload.getTaskId(), QueueTaskStatus.FAILED);
            }
        }
    }
}
