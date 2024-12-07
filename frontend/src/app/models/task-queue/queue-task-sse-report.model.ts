import QueueTaskStatus from "./queue-task-status.enum";

export default interface QueueTaskSseReport {
    date: Date;
    taskId: string;
    queueName: string;
    status: QueueTaskStatus;
}
