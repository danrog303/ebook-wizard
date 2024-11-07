import {AfterViewInit, Component, Inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {from} from "rxjs";
import {KeyValuePipe} from "@angular/common";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

import MaterialModule from "@app/modules/material.module";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import EbookFileService from "@app/services/ebook-file.service";
import NotificationService from "@app/services/notification.service";
import QueueTaskTrackingService from "@app/services/queue-task-tracking.service";
import AuthenticationService from "@app/services/authentication.service";
import EbookFormat from "@app/models/ebook/ebook-format.enum";
import QueueTask from "@app/models/task-queue/queue-task.model";
import QueueTaskPayload from "@app/models/task-queue/queue-task-payload.model";
import QueueTaskSseReport from "@app/models/task-queue/queue-task-sse-report.model";
import QueueTaskStatus from "@app/models/task-queue/queue-task-status.enum";

@Component({
    selector: 'app-send-modal',
    standalone: true,
    imports: [
        ActionPendingButtonComponent,
        MaterialModule,
        ReactiveFormsModule,
        KeyValuePipe
    ],
    templateUrl: './ebook-file-send-modal.component.html',
    styleUrl: './ebook-file-send-modal.component.scss'
})
export class EbookFileSendModalComponent implements AfterViewInit {
    /**
     * Flag which is set to true when modal performed an ebook file conversion.
     */
    conversionPerformed: boolean = false;

    /**
     * The ongoing action that the user is performing.
     * Used to show the loading spinner with appropriate label.
     */
    ongoingAction: "conversion" | "sending" | null = null;

    sendToReaderForm: FormGroup = new FormGroup({
        email: new FormControl("", [Validators.email, Validators.required]),
        format: new FormControl("", [Validators.required])
    });

    constructor(@Inject(MAT_DIALOG_DATA) public ebookFile: EbookFile,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookFileSendModalComponent>,
                private ebookFileService: EbookFileService,
                private notificationService: NotificationService,
                private queueTaskTrackingService: QueueTaskTrackingService,
                private authService: AuthenticationService) {
    }

    ngAfterViewInit() {
        if (localStorage.getItem("eReaderEmail")) {
            this.sendToReaderForm.get("email")?.setValue(localStorage.getItem("eReaderEmail"));
        } else {
            from(this.authService.fetchAuthenticatedUser()).subscribe({
                next: (user) => {
                    this.sendToReaderForm.get("email")?.setValue(user?.email || "");
                }
            });
        }
    }

    onSendEbookFile() {
        const targetEmail: string = this.sendToReaderForm.get("email")?.value;
        const targetFormat: string = this.sendToReaderForm.get("format")?.value;
        const ebookFileId = this.ebookFile.id!;

        if (this.isFormatReadyForSend(targetFormat as EbookFormat)) {
            this.sendEbook(targetEmail, targetFormat, ebookFileId);
        } else {
            this.sendEbookWithConversion(targetEmail, targetFormat, ebookFileId);
        }
    }

    sendEbook(email: string, format: string, ebookFileId: string) {
        this.ongoingAction = "sending";
        localStorage.setItem("eReaderEmail", email);

        this.ebookFileService.sendEbookFileToDevice(email, ebookFileId, format as EbookFormat).subscribe({
            next: () => {
                this.ongoingAction = null;
                this.dialogRef.close(true);
                this.notificationService.show($localize`Ebook file sent successfully!.`);
            },
            error: () => {
                this.ongoingAction = null;
                this.notificationService.show($localize`Failed to send the ebook file. Refresh the page and try again.`);
            }
        });
    }

    sendEbookWithConversion(targetEmail: string, targetFormat: string, ebookFileId: string) {
        this.ongoingAction = "conversion";

        this.ebookFileService.convertEbookToEbookFile(ebookFileId, targetFormat as EbookFormat).subscribe({
            next: (task: QueueTask<QueueTaskPayload>) => {
                this.queueTaskTrackingService.getTaskStatus(task.id).subscribe({
                    next: this.onConversionProgress.bind(this),
                    error: () => {
                        if (this.conversionPerformed) {
                            return;
                        }

                        this.notificationService.show($localize`Failed to convert the ebook file. Refresh the page and try again`);
                        this.ongoingAction = null;
                    }
                });
            },
            error: () => {
                this.notificationService.show($localize`Failed to convert the ebook file. Refresh the page and try again`);
                this.ongoingAction = null;
            }
        });
    }

    onConversionProgress(taskReport: QueueTaskSseReport) {
        if (taskReport.status === QueueTaskStatus.COMPLETED) {
            const targetEmail: string = this.sendToReaderForm.get("email")?.value;
            const targetFormat: string = this.sendToReaderForm.get("format")?.value;
            const ebookFileId = this.ebookFile.id!;
            this.conversionPerformed = true;
            this.sendEbook(targetEmail, targetFormat, ebookFileId);
        } else if (taskReport.status === QueueTaskStatus.FAILED) {
            this.notificationService.show($localize`Failed to convert the ebook file. Refresh the page and try again`);
            this.ongoingAction = null;
        }
    }

    isFormatReadyForSend(format: EbookFormat): boolean {
        return this.ebookFile.downloadableFiles
            ?.map(file => file.format)
            .includes(format) ?? false;
    }

    isFormatSupportedByReader() {
        const email: string = this.sendToReaderForm.get("email")?.value;
        const format: EbookFormat = this.sendToReaderForm.get("format")?.value;

        // Don't report warnings if the email or format is not set
        if (!email || !format) {
            return true;
        }

        const kindleApprovedFormats = [EbookFormat.MOBI, EbookFormat.AZW3];
        return !(email.includes("@kindle") && !kindleApprovedFormats.includes(format));
    }

    protected readonly EbookFormat = EbookFormat;
}
