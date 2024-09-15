import {Component, Inject} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {CommonModule} from "@angular/common";
import EbookFormat from "@app/models/ebook/ebook-format.enum";
import {FormsModule} from "@angular/forms";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import EbookProjectService from "@app/services/ebook-project.service";
import QueueTaskPayload from "@app/models/task-queue/queue-task-payload.model";
import QueueTask from "@app/models/task-queue/queue-task.model";
import NotificationService from "@app/services/notification.service";
import QueueTaskTrackingService from "@app/services/queue-task-tracking.service";
import QueueTaskSseReport from "@app/models/task-queue/queue-task-sse-report.model";
import {Router} from "@angular/router";

@Component({
    selector: 'app-convert-to-file-modal',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        MatRadioGroup,
        MatRadioButton,
        FormsModule
    ],
    templateUrl: './convert-to-file-modal.component.html',
    styleUrl: './convert-to-file-modal.component.scss'
})
export class ConvertEbookProjectToFileModalComponent {
    conversionStatus: LoadingStatus = LoadingStatus.NOT_STARTED;
    selectedFormat: EbookFormat = EbookFormat.AZW3;

    constructor(@Inject(MAT_DIALOG_DATA) public ebookProject: EbookProject,
                private dialogRef: MatDialogRef<ConvertEbookProjectToFileModalComponent>,
                private ebookProjectService: EbookProjectService,
                private notificationService: NotificationService,
                private trackingService: QueueTaskTrackingService,
                private router: Router) {
    }

    convertToEbookFile() {
        this.dialogRef.disableClose = true;
        this.conversionStatus = LoadingStatus.LOADING;

        this.ebookProjectService.convertToEbookFile(this.ebookProject.id, this.selectedFormat).subscribe({
            next: (task: QueueTask<QueueTaskPayload>) => {
                this.trackingService.getTaskStatus(task.id).subscribe(this.handleConversionTaskProgress());
            },
            error: () => {
                this.conversionStatus = LoadingStatus.ERROR;
                this.dialogRef.disableClose = false;
                this.notificationService.show($localize`Failed to convert project to file...`);
            }
        });
    }

    handleConversionTaskProgress() {
        return {
            next: (task: QueueTaskSseReport) => {
                if (task.status === 'COMPLETED') {
                    this.conversionStatus = LoadingStatus.LOADED;
                    this.dialogRef.disableClose = false;
                    this.notificationService.show($localize`Project converted to file successfully! Go into the files tab to find it.`);
                    this.dialogRef.close();
                } else if (task.status === 'FAILED') {
                    this.conversionStatus = LoadingStatus.ERROR;
                    this.dialogRef.disableClose = false;
                    this.notificationService.show($localize`Failed to convert project to file...`);
                }
            }
        }
    }

    protected readonly EbookFormat = EbookFormat;
    protected readonly LoadingStatus = LoadingStatus;
}
