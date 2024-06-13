package com.github.danrog303.ebookwizard.domain.taskqueue.tracking;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@RestController
@RequestMapping("/queue/task/tracking")
@RequiredArgsConstructor
public class QueueTaskTrackingController {
    private final QueueTaskTrackingService queueTaskTrackingService;

    @GetMapping("/{taskId}")
    public SseEmitter getTaskStatus(@PathVariable String taskId) {
        log.debug("Incoming request to track task with ID: {}", taskId);
        SseEmitter emitter = new SseEmitter();

        ExecutorService sseMvcExecutor = Executors.newSingleThreadExecutor();
        Runnable shutdownTask = () -> {
            log.debug("Shutting down SSE thread for task id={}", taskId);
            sseMvcExecutor.shutdown();
        };

        emitter.onCompletion(shutdownTask);
        emitter.onError((arg) -> shutdownTask.run());
        sseMvcExecutor.execute(() -> {
            queueTaskTrackingService.waitForTaskCompletion(emitter, taskId);
        });

        return emitter;
    }
}
