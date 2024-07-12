package com.github.danrog303.ebookwizard.domain.taskqueue.email;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.danrog303.ebookwizard.domain.taskqueue.QueueTaskConfig;
import com.github.danrog303.ebookwizard.domain.taskqueue.QueueTaskService;
import com.github.danrog303.ebookwizard.domain.taskqueue.QueueTaskStatus;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskPayload;
import com.github.danrog303.ebookwizard.external.email.EmailAttachment;
import com.github.danrog303.ebookwizard.external.email.EmailSenderService;
import com.github.danrog303.ebookwizard.external.storage.FileStorageService;
import com.github.danrog303.ebookwizard.util.temp.TemporaryDirectory;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailQueueService {
    private final QueueTaskConfig queueTaskConfig;
    private final QueueTaskService queueTaskService;
    private final EmailSenderService emailService;
    private final ObjectMapper objectMapper;
    private final FileStorageService fileStorageService;

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

            this.queueTaskService.updateTaskStatus(queueTaskPayload.getTaskId(), QueueTaskStatus.IN_PROGRESS);

            if (queueTaskPayload.getAttachments() != null && !queueTaskPayload.getAttachments().isEmpty()) {
                sendEmailWithAttachments(queueTaskPayload);
            } else {
                sendEmailWithoutAttachments(queueTaskPayload);
            }

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

    @SneakyThrows(IOException.class)
    private void sendEmailWithAttachments(EmailQueueTaskPayload payload) {
        try (TemporaryDirectory tempDir = new TemporaryDirectory()) {
            var emailAttachments = new ArrayList<EmailAttachment>();

            for (var attachment : payload.getAttachments()) {
                Path tempFile = Paths.get(tempDir.getDirectory().resolve(attachment.getFilename()).toString());
                Files.copy(this.fileStorageService.downloadFile(attachment.getS3ObjectKey()), tempFile);
                emailAttachments.add(new EmailAttachment(attachment.getFilename(), tempFile));
            }

            this.emailService.send(
                    payload.getTo(),
                    payload.getSubject(),
                    payload.getContentHtml(),
                    emailAttachments
            );
        }
    }

    private void sendEmailWithoutAttachments(EmailQueueTaskPayload payload) {
        this.emailService.send(payload.getTo(), payload.getSubject(), payload.getContentHtml());
    }
}
