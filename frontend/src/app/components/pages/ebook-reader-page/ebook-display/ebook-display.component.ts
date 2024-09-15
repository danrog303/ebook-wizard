import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import EbookFormat from "@app/models/ebook/ebook-format.enum";
import QueueTask from "@app/models/task-queue/queue-task.model";
import QueueTaskPayload from "@app/models/task-queue/queue-task-payload.model";
import QueueTaskSseReport from "@app/models/task-queue/queue-task-sse-report.model";
import QueueTaskStatus from "@app/models/task-queue/queue-task-status.enum";
import EbookFileService from "@app/services/ebook-file.service";
import QueueTaskTrackingService from "@app/services/queue-task-tracking.service";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import SafePipe from "@app/pipes/safe.pipe";

@Component({
    selector: 'app-ebook-reader-display',
    standalone: true,
    imports: [MatProgressSpinner, SafePipe],
    templateUrl: './ebook-display.component.html',
    styleUrl: './ebook-display.component.scss'
})
export default class EbookDisplayComponent implements OnChanges {
    fileUrl: string = "";
    fileUrlLoadingStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    @Input() ebookFile: EbookFile | null = null;
    @Input() ebookFormat: EbookFormat | null = null;

    conversionOngoing: boolean = false;

    constructor(private ebookFileService: EbookFileService,
                private queueTaskTrackingService: QueueTaskTrackingService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['ebookFormat']) {
            this.fetchRequestedFormat();
        }
    }

    hasRequestedFormat() {
        if (!this.ebookFile || !this.ebookFile.downloadableFiles) {
            return false;
        }

        return this.ebookFile.downloadableFiles.some(file => file.format === this.ebookFormat);
    }

    fetchRequestedFormat() {
        this.fileUrlLoadingStatus = LoadingStatus.LOADING;

        if (!this.hasRequestedFormat()) {
            this.conversionOngoing = true;
            this.ebookFileService.convertEbookToEbookFile(this.ebookFile?.id!, this.ebookFormat!).subscribe({
                next: (queueTask: QueueTask<QueueTaskPayload>) => {
                    this.queueTaskTrackingService.getTaskStatus(queueTask.id).subscribe({
                        next: (report: QueueTaskSseReport) => {
                            this.conversionOngoing = false;
                            if (report.status === QueueTaskStatus.COMPLETED) {
                                this.retrieveRequestedFormat();
                            } else if (report.status === QueueTaskStatus.FAILED) {
                                this.fileUrlLoadingStatus = LoadingStatus.ERROR;
                            }
                        },
                        error: () => {
                            this.conversionOngoing = false;
                            this.fileUrlLoadingStatus = LoadingStatus.ERROR;
                        }
                    });
                },
                error: () => {
                    this.fileUrlLoadingStatus = LoadingStatus.ERROR;
                }
            });
        } else {
            this.retrieveRequestedFormat();
        }
    }

    retrieveRequestedFormat() {
        const ebookFileId = this.ebookFile!.id!;

        // Because default "ATTACHMENT" would download the file instead of displaying it inline
        const dispositionType = "INLINE";

        this.ebookFileService.getUrlToDownloadFile(ebookFileId, this.ebookFormat!, dispositionType).subscribe({
            next: (url: string) => {
                this.fileUrl = url;
                this.fileUrlLoadingStatus = LoadingStatus.LOADED;
            },
            error: () => {
                this.fileUrlLoadingStatus = LoadingStatus.ERROR;
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
