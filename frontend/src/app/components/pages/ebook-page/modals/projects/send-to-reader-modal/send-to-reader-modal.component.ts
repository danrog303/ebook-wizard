import {Component, Inject} from '@angular/core';
import {KeyValuePipe} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import MaterialModule from "@app/modules/material.module";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import NotificationService from "@app/services/notification.service";
import QueueTaskTrackingService from "@app/services/queue-task-tracking.service";
import AuthenticationService from "@app/services/authentication.service";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import EbookProjectService from "@app/services/ebook-project.service";
import EbookFormat from "@app/models/ebook/ebook-format.enum";
import QueueTask from "@app/models/task-queue/queue-task.model";
import QueueTaskPayload from "@app/models/task-queue/queue-task-payload.model";
import QueueTaskSseReport from "@app/models/task-queue/queue-task-sse-report.model";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-send-to-reader-modal',
    standalone: true,
    imports: [
        KeyValuePipe,
        MaterialModule,
        ReactiveFormsModule
    ],
    templateUrl: './send-to-reader-modal.component.html',
    styleUrl: './send-to-reader-modal.component.scss'
})
export class EbookProjectSendToReaderModalComponent {
    /**
     * The ongoing action that the user is performing.
     * Used to show the loading spinner with appropriate label.
     */
    ongoingAction: "conversion" | "sending" | null = null;

    ongoingActionSubscription: Subscription | null = null;

    sendToReaderForm: FormGroup = new FormGroup({
        email: new FormControl("", [Validators.email, Validators.required]),
        format: new FormControl("", [Validators.required])
    });

    constructor(@Inject(MAT_DIALOG_DATA) public ebookProject: EbookProject,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookProjectSendToReaderModalComponent>,
                private ebookProjectService: EbookProjectService,
                private notificationService: NotificationService,
                private queueTaskTrackingService: QueueTaskTrackingService,
                private authService: AuthenticationService) {
    }

    protected readonly EbookFormat = EbookFormat;

    isFormatSupportedByReader() {
        const format: EbookFormat = this.sendToReaderForm.get("format")?.value;
        const email: string = this.sendToReaderForm.get("email")?.value;

        // Don't report warnings if the email or format is not set
        if (!email || !format) {
            return true;
        }

        const kindleApprovedFormats = [EbookFormat.MOBI, EbookFormat.AZW3];
        return !(email.includes("@kindle") && !kindleApprovedFormats.includes(format));
    }

    onSendEbookFile() {
        const format = this.sendToReaderForm.get("format")?.value;
        const email = this.sendToReaderForm.get("email")?.value;
        this.ongoingAction = "conversion";
        this.dialogRef.disableClose = true;

        this.ebookProjectService.sendToReader(this.ebookProject.id!, format, email).subscribe({
            next: (task: QueueTask<QueueTaskPayload>) => {
                this.ongoingAction = "sending";
                this.ongoingActionSubscription =
                    this.queueTaskTrackingService.getTaskStatus(task.id).subscribe(this.trackEmailStatus());
            },
            error: () => {
                this.dialogRef.disableClose = false;
                this.notificationService.show($localize`Failed to send the ebook project to the reader. Try again later.`);
                this.dialogRef.close();
            }
        });
    }

    trackEmailStatus() {
        return {
            next: (report: QueueTaskSseReport) => {
                if (report.status === "COMPLETED") {
                    this.ongoingAction = null;
                    this.dialogRef.close(true);
                    this.notificationService.show($localize`Ebook project sent successfully!`);
                    this.ongoingActionSubscription?.unsubscribe();
                } else if (report.status === "FAILED") {
                    this.ongoingAction = null;
                    this.dialogRef.disableClose = false;
                    this.notificationService.show($localize`Failed to send the ebook project to the reader. Try again later.`);
                    this.dialogRef.close();
                    this.ongoingActionSubscription?.unsubscribe();
                }
            },
            error: () => {
                this.notificationService.show($localize`Failed to send the ebook project to the reader. Try again later.`);
                this.dialogRef.close();
                this.ongoingActionSubscription?.unsubscribe();
            }
        }
    }
}
