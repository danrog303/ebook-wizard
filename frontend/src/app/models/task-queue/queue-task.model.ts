import QueueTaskStatus from "./queue-task-status.enum";
import QueueTaskPayload from "./queue-task-payload.model";

interface QueueTask<T extends QueueTaskPayload> {
    id: string;
    queueName: string;
    taskPayload: T;
    status: QueueTaskStatus;
    creationDate: Date;
    expirationDate: Date;
}

export default QueueTask;
