package com.github.danrog303.ebookwizard.domain.taskqueue.email;

import com.github.danrog303.ebookwizard.domain.taskqueue.common.QueueTaskPayload;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

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
    public static class EmailQueueTaskPayloadAttachment {
        String filename;
        String s3ObjectKey;
    }
}
