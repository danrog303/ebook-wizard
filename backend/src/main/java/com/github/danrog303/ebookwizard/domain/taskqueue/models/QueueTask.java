package com.github.danrog303.ebookwizard.domain.taskqueue.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.danrog303.ebookwizard.domain.taskqueue.QueueTaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "queueTasks")
@Data @AllArgsConstructor @NoArgsConstructor
public class QueueTask<T extends QueueTaskPayload> {
    @Id
    private String id;

    @NotNull
    @JsonIgnore
    private String queueName;

    private T taskPayload;

    @NotNull
    private QueueTaskStatus status;

    @NotNull
    private Date creationDate;

    @NotNull
    private Date expirationDate;
}
