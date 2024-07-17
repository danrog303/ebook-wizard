import QueueTaskStatus from "./queue-task-status.enum";

export default interface QueueTaskSseReport {
    date: Date;
    taskId: String;
    queueName: String;
    status: QueueTaskStatus;
}
