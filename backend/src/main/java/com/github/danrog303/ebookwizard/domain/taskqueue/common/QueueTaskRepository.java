package com.github.danrog303.ebookwizard.domain.taskqueue.common;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface QueueTaskRepository<T extends QueueTaskPayload> extends MongoRepository<QueueTask<T>, String> {
}
