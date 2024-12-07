import {
    AfterViewInit,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewChild
} from '@angular/core';
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
import {PdfViewerComponent} from "@app/components/common/pdf-viewer/pdf-viewer.component";
import {CommonModule} from "@angular/common";
import MaterialModule from "@app/modules/material.module";
import {
    AudiobookMenuComponent,
    AudiobookMenuContext
} from "@app/components/pages/ebook-reader-page/audiobook-menu/audiobook-menu.component";
import {
    BookmarkMenuComponent,
    BookmarkMenuContext
} from "@app/components/pages/ebook-reader-page/bookmark-menu/bookmark-menu.component";
import AuthenticationService from "@app/services/authentication.service";
import {
    PageJumpMenuComponent,
    PageJumpMenuContext
} from "@app/components/pages/ebook-reader-page/page-jump-menu/page-jump-menu.component";

@Component({
    selector: 'app-ebook-reader-display',
    standalone: true,
    imports: [SafePipe, PdfViewerComponent, CommonModule, MaterialModule, AudiobookMenuComponent, BookmarkMenuComponent, PageJumpMenuComponent],
    templateUrl: './ebook-display.component.html',
    styleUrl: './ebook-display.component.scss'
})
export default class EbookDisplayComponent implements AfterViewInit, OnChanges, OnDestroy {
    fileUrl: string = "";
    fileUrlLoadingStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    readerWidth: string = "calc((100vh - 2em) * 0.77272)";
    readerHeight: string = "calc(100vh - 2em)";

    @Input() ebookFile: EbookFile | null = null;
    @Input() ebookFormat: EbookFormat | null = null;
    @ViewChild(PdfViewerComponent) pdfViewerComponent!: PdfViewerComponent;
    @ViewChild(AudiobookMenuComponent) audiobookMenuComponent!: AudiobookMenuComponent;

    conversionOngoing: boolean = false;
    audiobookPlayerContext: AudiobookMenuContext | null = null;
    bookmarkMenuContext: BookmarkMenuContext | null = null;
    pageJumpMenuContext: PageJumpMenuContext | null = null;

    constructor(private readonly ebookFileService: EbookFileService,
                private readonly queueTaskTrackingService: QueueTaskTrackingService,
                private readonly authService: AuthenticationService) {
    }

    async ngAfterViewInit() {
        this.pageJumpMenuContext = {
            getMaxPage: () => this.getMaxPage(),
            changePage: (pageNumber: number) => this.pageJump(pageNumber),
        };

        this.audiobookPlayerContext = {
            openNextPage: this.pageForward.bind(this),
            getCurrentText: () => this.pdfViewerComponent.getTextContent(this.pdfViewerComponent.currentPage),
            isNextPageAvailable: () => this.pdfViewerComponent.currentPage < this.pdfViewerComponent.getMaxPages(),
        };

        this.bookmarkMenuContext = {
            changePage: (pageNumber: number) => this.pdfViewerComponent.goToPage(pageNumber),
            getCurrentPage: () => this.pdfViewerComponent.currentPage,
        };
    }

    async ngOnDestroy() {
        await this.audiobookMenuComponent?.stopAudio();
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

    getMaxPage() {
        return this.pdfViewerComponent.getMaxPages();
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

    async pageForward($event: MouseEvent | undefined = undefined) {
        if ($event && ($event.target as HTMLElement).classList.contains("disabled")) {
            return;
        }

        await this.pdfViewerComponent.goToPage(this.pdfViewerComponent.currentPage + 1);
    }

    async pageBackward($event: MouseEvent | undefined = undefined) {
        if ($event && ($event.target as HTMLElement).classList.contains("disabled")) {
            return;
        }

        await this.pdfViewerComponent.goToPage(this.pdfViewerComponent.currentPage - 1);
    }

    async pageJump(pageNumber: number) {
        await this.pdfViewerComponent.goToPage(pageNumber);
    }

    protected readonly LoadingStatus = LoadingStatus;
}
