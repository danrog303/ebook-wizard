import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {KeyValuePipe, UpperCasePipe} from "@angular/common";
import structuredClone from '@ungap/structured-clone';
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import MaterialModule from "@app/modules/material.module";
import FileDownloadService from "@app/services/file-download.service";
import QueueTaskTrackingService from "@app/services/queue-task-tracking.service";
import NotificationService from "@app/services/notification.service";
import EbookFileService from "@app/services/ebook-file.service";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import EbookFormat from "@app/models/ebook/ebook-format.enum";
import QueueTaskSseReport from "@app/models/task-queue/queue-task-sse-report.model";
import QueueTask from "@app/models/task-queue/queue-task.model";
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import QueueTaskPayload from "@app/models/task-queue/queue-task-payload.model";

@Component({
    selector: 'app-download-modal',
    standalone: true,
    imports: [
        ActionPendingButtonComponent,
        MaterialModule,
        KeyValuePipe,
        UpperCasePipe
    ],
    templateUrl: './ebook-file-download-modal.component.html',
    styleUrl: './ebook-file-download-modal.component.scss'
})
export class EbookFileDownloadModalComponent implements OnInit {
    /**
     * The formats that are not available for download.
     * The user can request to convert the ebook to one of these formats to make it downloadable.
     */
    otherFormats: EbookFormat[] = [];

    /**
     * The formats that are available for download.
     */
    availableFormats: EbookFormat[] = [];

    /**
     * The format that the user is currently performing an action on.
     */
    ongoingActionItem: EbookFormat | null = null;

    /**
     * Dirty flag is set when user performed an action that requires a refresh
     */
    modalDirty: boolean = false;

    /**
     * Whether the screen is small or not.
     */
    smallScreen: boolean = false;

    constructor(@Inject(MAT_DIALOG_DATA) public ebookFile: EbookFile,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookFileDownloadModalComponent>,
                private ebookFileService: EbookFileService,
                private notificationService: NotificationService,
                private fileDownloadService: FileDownloadService,
                private queueTaskTrackingService: QueueTaskTrackingService,
                private breakpointObserver: BreakpointObserver) {
    }

    ngOnInit() {
        // Get the formats that are available for download
        this.availableFormats = this.ebookFile.downloadableFiles
            ?.map(file => file.format) || [];

        // Get the formats that are not available for download
        this.otherFormats = Object.values(EbookFormat)
              .filter(format => !this.availableFormats.includes(format));

        // Setup breakpoint observer
        this.breakpointObserver.observe(['(max-width: 600px)']).subscribe((state: BreakpointState) => {
            this.smallScreen = state.matches;
        });
    }

    onDownloadFormat(format: EbookFormat) {
        this.ebookFileService.getUrlToDownloadFile(this.ebookFile.id!, format.toUpperCase()).subscribe({
            next: (url: string) => {
                let fileName = `${this.ebookFile.name}.${format.toLowerCase()}`;
                if (fileName.startsWith(".")) {
                    fileName = "ebook" + fileName;
                }

                this.fileDownloadService.downloadFile(url, fileName);
                this.dialogRef.close(true);
            },
            error: this.handleError.bind(this)
        });
    }

    onConvertToFormat(format: EbookFormat) {
        this.ongoingActionItem = format;

        this.ebookFileService.convertEbookToEbookFile(this.ebookFile.id!, format.toUpperCase()).subscribe({
            next: (queueTask: QueueTask<QueueTaskPayload>) => {
                const taskId = queueTask.id;
                this.queueTaskTrackingService.getTaskStatus(taskId).subscribe({
                    next: (conversionProgress: QueueTaskSseReport) => this.onConversionProgress(format, conversionProgress),
                    error: this.handleError.bind(this)
                })
            },
            error: this.handleError.bind(this)
        });
    }

    onConversionProgress(format: EbookFormat, conversionProgress: QueueTaskSseReport) {
        if (conversionProgress.status === 'COMPLETED') {
            this.ongoingActionItem = null;
            this.availableFormats.push(format);
            this.otherFormats = this.otherFormats.filter(f => f !== format);
            this.modalDirty = true;
        } else if (conversionProgress.status === 'FAILED') {
            this.handleError("Conversion tracking job failed.")
        }
    }

    onDeleteFormat(format: EbookFormat) {
        this.ongoingActionItem = format;

        this.ebookFileService.deleteEbookFileFormat(this.ebookFile.id!, format.toUpperCase()).subscribe({
            next: () => {
                this.ongoingActionItem = null;
                this.availableFormats = this.availableFormats.filter(f => f !== format);
                this.otherFormats.push(format);
                this.modalDirty = true;
            },
            error: this.handleError.bind(this)
        });
    }

    onChangeFormatToSource(format: EbookFormat) {
        this.ongoingActionItem = format;

        const ebookFile = structuredClone(this.ebookFile);
        ebookFile.conversionSourceFormat = format;

        this.ebookFileService.updateEbookFile(this.ebookFile.id!, ebookFile).subscribe({
            next: () => {
                this.ongoingActionItem = null;
                this.modalDirty = true;
                this.ebookFile = ebookFile;
            },
            error: this.handleError.bind(this)
        });

    }

    handleError(err: any) {
        if (this.ongoingActionItem === null) {
            return;
        }

        if (JSON.stringify(err).includes("FileStorageQuotaExceededException")) {
            this.notificationService.show($localize`File storage quota exceeded. Please delete some files and try again.`);
        } else {
            this.notificationService.show($localize`Failed to perform the requested action. Refresh the page and try again.`);
        }

        console.error(err);
        this.ongoingActionItem = null;
    }

    protected readonly EbookFormat = EbookFormat;
}
