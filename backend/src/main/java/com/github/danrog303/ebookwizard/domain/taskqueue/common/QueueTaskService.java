package com.github.danrog303.ebookwizard.domain.taskqueue.common;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.awspring.cloud.sqs.operations.SqsTemplate;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.SerializationUtils;
import org.springframework.stereotype.Service;

import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class QueueTaskService {
    private final QueueTaskRepository<QueueTaskPayload> queueTaskRepository;
    private final SqsTemplate queueMessagingTemplate;
    private final ObjectMapper objectMapper;

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
        task.setExpirationDate(new Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000));

        final var updatedTask = queueTaskRepository.save(task);
        payloadClone.setTaskId(updatedTask.getId());
        var payloadCloneJson = objectMapper.writeValueAsString(payloadClone);

        queueMessagingTemplate.send(to -> to.queue(queueUrl).payload(payloadCloneJson));
        log.debug("Task id={} enqueued to queue {}", updatedTask.getId(), queueUrl);
        return task;
    }

    public void updateTaskStatus(String taskId, QueueTaskStatus status) {
        log.debug("Updating task with id={} to {}", taskId, status);
        QueueTask<QueueTaskPayload> task = queueTaskRepository.findById(taskId).orElseThrow();
        task.setStatus(status);
        queueTaskRepository.save(task);
    }
}
