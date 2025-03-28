package com.github.danrog303.ebookwizard.domain.taskqueue.conversion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.danrog303.ebookwizard.domain.ebookfile.services.EbookFileConversionService;
import com.github.danrog303.ebookwizard.domain.ebookfile.services.EbookFileLockService;
import com.github.danrog303.ebookwizard.domain.ebookproject.services.EbookProjectConversionService;
import com.github.danrog303.ebookwizard.domain.taskqueue.QueueTaskConfig;
import com.github.danrog303.ebookwizard.domain.taskqueue.QueueTaskService;
import com.github.danrog303.ebookwizard.domain.taskqueue.QueueTaskStatus;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskPayload;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversionQueueService {
    private final QueueTaskService queueTaskService;
    private final QueueTaskConfig queueTaskConfig;
    private final ObjectMapper objectMapper;
    private final EbookFileConversionService ebookFileConversionService;
    private final EbookFileLockService ebookFileLockService;
    private final EbookProjectConversionService ebookProjectConversionService;

    public QueueTask<QueueTaskPayload> enqueueConversionTask(ConversionQueueTaskPayload conversionQueueTaskPayload) {
        String conversionQueueUrl = this.queueTaskConfig.getConversionQueueUrl();
        return this.queueTaskService.enqueueTask(conversionQueueUrl, conversionQueueTaskPayload);
    }

    @SqsListener(value="${ebook-wizard.queue.sqs.conversion-queue-url}", maxConcurrentMessages="2", maxMessagesPerPoll="2")
    private void processConversionQueue(String payloadJson) {
        ConversionQueueTaskPayload queueTaskPayload = null;
        try {
            log.debug("Unmarshalling conversion task payload: {}", payloadJson);
            queueTaskPayload = this.objectMapper.readValue(payloadJson, ConversionQueueTaskPayload.class);
            log.debug("Processing conversion task: {}", queueTaskPayload.getTaskId());

            this.queueTaskService.updateTaskStatus(queueTaskPayload.getTaskId(), QueueTaskStatus.IN_PROGRESS);

            if (queueTaskPayload.conversionType == ConversionQueueTaskType.PROJECT_TO_FILE) {
                this.ebookProjectConversionService.convertEbookProjectToEbookFile(queueTaskPayload.getInstanceId(), queueTaskPayload.getAdditionalInfo());
            } else if (queueTaskPayload.conversionType == ConversionQueueTaskType.FILE_TO_PROJECT) {
                this.ebookFileConversionService.convertEbookFileToEbookProject(queueTaskPayload.getInstanceId());
            } else if (queueTaskPayload.conversionType == ConversionQueueTaskType.FILE_TO_FILE) {
                this.ebookFileConversionService.addNewFileFormatToEbookFile(queueTaskPayload.getInstanceId(), queueTaskPayload.getAdditionalInfo());
            } else {
                log.error("Unknown conversion type: {}", queueTaskPayload.conversionType);
                this.queueTaskService.updateTaskStatus(queueTaskPayload.getTaskId(), QueueTaskStatus.FAILED);
                return;
            }

            this.queueTaskService.updateTaskStatus(queueTaskPayload.getTaskId(), QueueTaskStatus.COMPLETED);
            log.debug("Processing conversion task completed: {}", queueTaskPayload.getTaskId());
        } catch (Exception e) {
            if (queueTaskPayload == null) {
                log.error("Failed to obtain conversion queue task payload: {}", payloadJson);
            } else {
                log.error("Processing conversion task failed: {}", queueTaskPayload.getTaskId(), e);
                if (queueTaskPayload.conversionType.equals(ConversionQueueTaskType.FILE_TO_FILE)) {
                    this.ebookFileLockService.unlockEbookFileForEditing(queueTaskPayload.getInstanceId());
                }

                this.queueTaskService.updateTaskStatus(queueTaskPayload.getTaskId(), QueueTaskStatus.FAILED);
            }
        }
    }
}
