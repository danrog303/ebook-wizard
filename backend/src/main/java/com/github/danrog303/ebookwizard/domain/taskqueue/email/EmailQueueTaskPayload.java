package com.github.danrog303.ebookwizard.domain.taskqueue.email;

import com.github.danrog303.ebookwizard.domain.taskqueue.models.QueueTaskPayload;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor @AllArgsConstructor
public class EmailQueueTaskPayload extends QueueTaskPayload {
    String to;
    String subject;
    String contentHtml;
    List<EmailQueueTaskPayloadAttachment> attachments;

    @Data
    @NoArgsConstructor @AllArgsConstructor
    public static class EmailQueueTaskPayloadAttachment implements Serializable {
        String filename;
        String s3ObjectKey;
    }
}
