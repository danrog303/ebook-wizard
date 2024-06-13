package com.github.danrog303.ebookwizard.domain.taskqueue.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor @NoArgsConstructor
public abstract class QueueTaskPayload implements Serializable {
    private String taskId;
}
