package com.github.danrog303.ebookwizard.domain.taskqueue;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskPayload;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskRepository;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.SerializationUtils;
import org.springframework.stereotype.Service;

import java.util.Date;

/**
 * Service for managing tasks in the queue.
 * Allows to enqueue tasks to the queue and update their status.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QueueTaskService {
    private final QueueTaskRepository<QueueTaskPayload> queueTaskRepository;
    private final SqsTemplate queueMessagingTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Pushes task to the SQS queue and saves task status information to the database.
     * @param queueUrl URL of the AWS SQS queue
     * @param payload Payload of the task (additional data attached to the task)
     * @return Object containing the task ID and other information
     */
    @SneakyThrows(JsonProcessingException.class)
    public QueueTask<QueueTaskPayload> enqueueTask(String queueUrl, QueueTaskPayload payload) {
        log.debug("Enqueueing task to queue {}", queueUrl);

        // Clone the payload to avoid modifying id of the original object
        var payloadClone = SerializationUtils.clone(payload);

        var task = new QueueTask<>();
        task.setId(null);
        task.setQueueName(queueUrl);
        task.setTaskPayload(payloadClone);
        task.setStatus(QueueTaskStatus.IN_QUEUE);
        task.setCreationDate(new Date());

        final var updatedTask = queueTaskRepository.save(task);
        payloadClone.setTaskId(updatedTask.getId());
        var payloadCloneJson = objectMapper.writeValueAsString(payloadClone);

        queueMessagingTemplate.send(to -> to.queue(queueUrl).payload(payloadCloneJson));
        log.debug("Task id={} enqueued to queue {}", updatedTask.getId(), queueUrl);
        return task;
    }

    /**
     * Updates the status of the task in the database.
     * @param taskId ID of the task to update
     * @param status New status of the task
     */
    public void updateTaskStatus(String taskId, QueueTaskStatus status) {
        log.debug("Updating task with id={} to {}", taskId, status);
        QueueTask<QueueTaskPayload> task = queueTaskRepository.findById(taskId).orElseThrow();
        task.setStatus(status);
        queueTaskRepository.save(task);
    }
}
