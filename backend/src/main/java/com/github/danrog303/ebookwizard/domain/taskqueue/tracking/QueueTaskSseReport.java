package com.github.danrog303.ebookwizard.domain.taskqueue.tracking;

import com.github.danrog303.ebookwizard.domain.taskqueue.QueueTaskStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * When user requests SSE updates for a task, instance of this class is send to the user.
 */
@Data @AllArgsConstructor @NoArgsConstructor
public class QueueTaskSseReport {
    private Date date;
    private String taskId;
    private String queueName;
    private QueueTaskStatus status;
}
