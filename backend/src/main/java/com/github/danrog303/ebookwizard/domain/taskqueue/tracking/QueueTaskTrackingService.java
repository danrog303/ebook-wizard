package com.github.danrog303.ebookwizard.domain.taskqueue.tracking;

import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTask;
import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskRepository;
import com.github.danrog303.ebookwizard.domain.taskqueue.QueueTaskStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Date;

/**
 * Service for tracking task status using Server-Sent Events.
 * When task with given ID is completed, emitter is closed.
 * When task with given ID is not found, returns task object with status "NOT_FOUND".
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QueueTaskTrackingService {
    private final QueueTaskRepository<?> queueTaskRepository;

    public void waitForTaskCompletion(SseEmitter emitter, String taskId) {
        queueTaskRepository.findById(taskId).ifPresentOrElse(
                onTaskFound -> onTaskFound(onTaskFound, emitter),
                () -> onTaskNotFound(taskId, emitter)
        );
    }

    @SuppressWarnings("BusyWait")
    private void onTaskFound(QueueTask<?> task, SseEmitter emitter) {
        try {
            if (task.getStatus() != QueueTaskStatus.IN_QUEUE && task.getStatus() != QueueTaskStatus.IN_PROGRESS) {
                log.debug("Task with ID {} is already finished ({})", task.getId(), task.getStatus());
                var sseReport = createSseReport(task);
                emitter.send(sseReport);
                emitter.complete();
                return;
            }

            while (task.getStatus() == QueueTaskStatus.IN_QUEUE || task.getStatus() == QueueTaskStatus.IN_PROGRESS) {
                log.debug("Task with ID {} is still in progress ({})", task.getId(), task.getStatus());
                emitter.send(createSseReport(task));
                Thread.sleep(5000);
                task = queueTaskRepository.findById(task.getId()).orElseThrow();
            }

            log.debug("Task with ID {} finished ({})", task.getId(), task.getStatus());
            emitter.send(createSseReport(task));
            emitter.complete();
        } catch (IOException | InterruptedException e) {
            log.debug("SSE stream for task id={} stopped", task.getId());
        }
    }

    private QueueTaskSseReport createSseReport(QueueTask<?> task) {
        var sseReport = new QueueTaskSseReport();
        sseReport.setTaskId(task.getId());
        sseReport.setDate(new Date());
        sseReport.setQueueName(task.getQueueName());
        sseReport.setStatus(task.getStatus());
        return sseReport;
    }

    private void onTaskNotFound(String taskId, SseEmitter emitter) {
        log.debug("Task with ID {} not found", taskId);

        var sseReport = new QueueTaskSseReport();
        sseReport.setTaskId(taskId);
        sseReport.setDate(new Date());
        sseReport.setQueueName(null);
        sseReport.setStatus(QueueTaskStatus.NOT_FOUND);

        try {
            emitter.send(sseReport);
            emitter.complete();
        } catch (IOException e) {
            log.debug("SSE stream for task id={} stopped", taskId);
        }
    }
}
