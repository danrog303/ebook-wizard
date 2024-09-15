import {Component, Inject} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {NgClass} from "@angular/common";
import EbookFileService from "@app/services/ebook-file.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import QueueTaskPayload from "@app/models/task-queue/queue-task-payload.model";
import QueueTask from "@app/models/task-queue/queue-task.model";
import QueueTaskTrackingService from "@app/services/queue-task-tracking.service";
import NotificationService from "@app/services/notification.service";
import QueueTaskSseReport from "@app/models/task-queue/queue-task-sse-report.model";
import QueueTaskStatus from "@app/models/task-queue/queue-task-status.enum";
import LoadingStatus from "@app/models/misc/loading-status.enum";

@Component({
    selector: 'app-convert-ebook-file-to-project-modal',
    standalone: true,
    imports: [MaterialModule, NgClass],
    templateUrl: './convert-to-project-modal.component.html',
    styleUrl: './convert-to-project-modal.component.scss'
})
export class ConvertEbookFileToProjectModalComponent {
    deleteEbookFile: boolean = false;

    ongoingAction: string = "";
    ongoingActionStatus: LoadingStatus = LoadingStatus.NOT_STARTED

    constructor(@Inject(MAT_DIALOG_DATA) public ebookFile: EbookFile,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<ConvertEbookFileToProjectModalComponent>,
                private ebookFileService: EbookFileService,
                private queueTaskTrackingService: QueueTaskTrackingService,
                private notificationService: NotificationService) {}

    convertToProject() {
        this.ongoingAction = "conversion";
        this.ongoingActionStatus = LoadingStatus.LOADING;

        this.ebookFileService.convertEbookFileToEbookProject(this.ebookFile.id!).subscribe({
            next: (task: QueueTask<QueueTaskPayload>) => {
                this.queueTaskTrackingService.getTaskStatus(task.id).subscribe({
                    next: (taskStatus: QueueTaskSseReport) => {
                        this.handleConversionProgress(taskStatus);
                    }
                })
            },
            error: (_) => {
                this.dialogRef.disableClose = false;
                this.notificationService.show($localize`Failed to convert ebook file to project.`);
            }
        });
    }

    handleConversionProgress(progress: QueueTaskSseReport) {
        if (progress.status === QueueTaskStatus.COMPLETED) {
            if (this.deleteEbookFile) {
                this.handleDeleteEbookFile();
            } else {
                this.dialogRef.disableClose = false;
                this.ongoingActionStatus = LoadingStatus.LOADED;
                this.notificationService.show($localize`Ebook file converted to project successfully. You can now view it in the projects tab.`);
                this.dialogRef.close(true);
            }
        } else if (progress.status === QueueTaskStatus.FAILED) {
            this.dialogRef.disableClose = false;
            this.notificationService.show($localize`Failed to convert ebook file to project.`);
            this.dialogRef.close();
        }
    }

    handleDeleteEbookFile() {
        this.ongoingAction = "deletion";
        this.ongoingActionStatus = LoadingStatus.LOADING;

        this.ebookFileService.deleteEbookFile(this.ebookFile.id!).subscribe({
            next: () => {
                this.ongoingActionStatus = LoadingStatus.LOADED;
                this.notificationService.show($localize`Ebook file converted and deleted successfully.`);
                this.dialogRef.close(true);
                this.dialogRef.disableClose = false;
            },
            error: () => {
                this.notificationService.show($localize`Failed to delete ebook file.`);
                this.dialogRef.close();
                this.dialogRef.disableClose = false;
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
