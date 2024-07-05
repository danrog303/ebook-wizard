package com.github.danrog303.ebookwizard.domain.taskqueue.conversion;

import com.github.danrog303.ebookwizard.domain.taskqueue.database.QueueTaskPayload;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor @NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ConversionQueueTaskPayload extends QueueTaskPayload {
    /**
     * Identifier of EbookProject or EbookFile to be converted.
     * If conversionType is PROJECT_TO_FILE, this should be an EbookProject ID.
     * If conversionType is FILE_TO_PROJECT or FILE_TO_FILE, this should be an EbookFile ID.
     */
    String instanceId;

    /**
     * Type of conversion to be performed.
     */
    ConversionQueueTaskType conversionType;


    /**
     * Additional information about the conversion task.
     * This can be used to store additional information about the task, such as the desired output format.
     * If conversionType is PROJECT_TO_FILE or FILE_TO_FILE, this should be the desired output format (e.g. "PDF").
     * If conversionType is FILE_TO_PROJECT, this should be null
     */
    String additionalInfo;
}
