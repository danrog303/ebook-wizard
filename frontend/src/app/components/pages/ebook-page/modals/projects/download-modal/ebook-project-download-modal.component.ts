import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DatePipe, KeyValuePipe, UpperCasePipe} from "@angular/common";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import MaterialModule from "@app/modules/material.module";
import FileDownloadService from "@app/services/file-download.service";
import NotificationService from "@app/services/notification.service";
import EbookFormat from "@app/models/ebook/ebook-format.enum";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import EbookProjectService from "@app/services/ebook-project.service";
import EbookDownloadableResource from "@app/models/ebook/ebook-downloadable-resource.model";

@Component({
    selector: 'app-ebook-project-download-modal',
    standalone: true,
    imports: [
        ActionPendingButtonComponent,
        MaterialModule,
        KeyValuePipe,
        UpperCasePipe,
        DatePipe
    ],
    templateUrl: './ebook-project-download-modal.component.html',
    styleUrl: './ebook-project-download-modal.component.scss'
})
export class EbookProjectDownloadModalComponent {
    ongoingTaskStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    constructor(@Inject(MAT_DIALOG_DATA) public ebookProject: EbookProject,
                @Inject(MatDialogRef) private readonly dialogRef: MatDialogRef<EbookProjectDownloadModalComponent>,
                private readonly ebookProjectService: EbookProjectService,
                private readonly notificationService: NotificationService,
                private readonly fileDownloadService: FileDownloadService) {
    }

    onCreateDownloadLink(format: EbookFormat) {
        this.ongoingTaskStatus = LoadingStatus.LOADING;
        this.ebookProjectService.addEbookFormat(this.ebookProject.id, format).subscribe({
            next: (downloadUrl: string) => {
                this.ongoingTaskStatus = LoadingStatus.LOADED;
                const filename = this.ebookProject.name + '.' + format;
                this.fileDownloadService.downloadFile(downloadUrl, filename);
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.ongoingTaskStatus = LoadingStatus.ERROR;
                if (JSON.stringify(err).includes("FileStorageQuotaExceededException")) {
                    this.notificationService.show($localize`Failed to create download link. File storage quota exceeded.`);
                } else {
                    this.notificationService.show($localize`Failed to create download link. Please try again later.`);
                }
            }
        });
    }

    onDownloadExistingLink(file: EbookDownloadableResource) {
        this.ongoingTaskStatus = LoadingStatus.LOADING;
        this.ebookProjectService.getEbookDownloadUrl(this.ebookProject.id, file.stub).subscribe({
            next: (downloadUrl: string) => {
                this.ongoingTaskStatus = LoadingStatus.LOADED;
                const filename = this.ebookProject.name + '.' + file.format;
                this.fileDownloadService.downloadFile(downloadUrl, filename);
                this.dialogRef.close();
            },
            error: () => {
                this.ongoingTaskStatus = LoadingStatus.ERROR;
                this.notificationService.show($localize`Failed to download the file. Please try again later.`);
            }
        });
    }

    onDeleteExistingLink(file: EbookDownloadableResource) {
        this.ongoingTaskStatus = LoadingStatus.LOADING;
        this.ebookProjectService.deleteEbookFormat(this.ebookProject.id, file.stub).subscribe({
            next: () => {
                this.ongoingTaskStatus = LoadingStatus.LOADED;
                this.notificationService.show($localize`Download link removed successfully.`);
                this.dialogRef.close(true);
            },
            error: () => {
                this.ongoingTaskStatus = LoadingStatus.ERROR;
                this.notificationService.show($localize`Failed to remove download link. Please try again later.`);
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
    protected readonly EbookFormat = EbookFormat;
}
