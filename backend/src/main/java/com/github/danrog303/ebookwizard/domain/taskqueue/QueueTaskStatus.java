package com.github.danrog303.ebookwizard.domain.taskqueue;

/**
 * Enum for the status of a QueueTask.
 * This status is saved in MongoDB database and is used to determine
 * whether the task is still in queue or finished.
 */
public enum QueueTaskStatus {
    IN_QUEUE,
    IN_PROGRESS,
    COMPLETED,
    FAILED,
    ABORTED,
    NOT_FOUND
}
