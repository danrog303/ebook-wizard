package com.github.danrog303.ebookwizard.domain.taskqueue.conversion;

/**
 * Represents the types of conversion tasks that can be queued.
 */
public enum ConversionQueueTaskType {
    /**
     * Convert an EbookFile to the EbookProject.
     */
    FILE_TO_PROJECT,

    /**
     * Render an EbookProject to a file (e.g. PDF, MOBI, etc.).
     */
    PROJECT_TO_FILE,

    /**
     * Convert an EbookFile to a different format (e.g. converts MOBI to PDF).
     */
    FILE_TO_FILE
}
