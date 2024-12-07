import {Component, Inject, ViewChild} from '@angular/core';
import LoadingStatus from "@app/models/misc/loading-status.enum";
import {NgxFileDragDropComponent} from "ngx-file-drag-drop";
import {ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import UploadProgressEvent from "@app/models/misc/upload-progress-event.model";
import {Subscription} from "rxjs";
import NotificationService from "@app/services/notification.service";
import MaterialModule from "@app/modules/material.module";
import {NgClass} from "@angular/common";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import EbookFileService from "@app/services/ebook-file.service";

@Component({
    selector: 'app-ebook-file-change-cover-modal',
    standalone: true,
    imports: [
        MaterialModule,
        NgxFileDragDropComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './ebook-file-change-cover-modal.component.html',
    styleUrl: './ebook-file-change-cover-modal.component.scss'
})
export class EbookFileChangeCoverModalComponent {
    @ViewChild("fileInput") fileInput: NgxFileDragDropComponent | null = null;
    ongoingActionStatus: LoadingStatus = LoadingStatus.NOT_STARTED;
    coverImageUploadSubscription: Subscription | null = null;
    coverImageUploadProgress: number = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public readonly ebookFile: EbookFile,
                @Inject(MatDialogRef) private readonly dialogRef: MatDialogRef<EbookFileChangeCoverModalComponent>,
                private readonly ebookFileService: EbookFileService,
                private readonly notificationService: NotificationService) {
    }

    onFileChosen(files: File[]) {
        if (files.length === 0) {
            return;
        }

        if (this.ongoingActionStatus !== LoadingStatus.NOT_STARTED && this.ongoingActionStatus !== LoadingStatus.ERROR) {
            return;
        }

        if (files[0].size > this.ebookFileService.MAX_FILE_COVER_IMAGE_SIZE_BYTES) {
            this.notificationService.show($localize`Cover image size must be less than 5 MB.`);
            this.fileInput?.clear();
            return;
        }

        this.ongoingActionStatus = LoadingStatus.LOADING;

        this.dialogRef.disableClose = true;
        this.coverImageUploadSubscription = this.ebookFileService.updateEbookFileCoverImage(files[0], this.ebookFile.id!).subscribe({
            next: this.onUploadProgress.bind(this),
            error: (err) => {
                this.handleError(err);
            }
        });
    }

    onUploadProgress(event: UploadProgressEvent<EbookFile>) {
        if (event.progress === 100 && event.result) {
            this.dialogRef.disableClose = false;
            this.coverImageUploadSubscription?.unsubscribe();
            this.ongoingActionStatus = LoadingStatus.LOADED;
            this.ebookFile.coverImageKey = event.result.coverImageKey;
            this.notificationService.show($localize`Cover image updated successfully.`);
            this.dialogRef.close(true);
        } else {
            this.ongoingActionStatus = LoadingStatus.LOADING;
            this.coverImageUploadProgress = event.progress;
        }
    }

    onDeleteCoverImage() {
        this.ongoingActionStatus = LoadingStatus.LOADING;
        this.coverImageUploadProgress = 100;
        this.dialogRef.disableClose = true;

        this.ebookFileService.deleteCoverImage(this.ebookFile.id!).subscribe({
            next: () => {
                this.dialogRef.disableClose = false;
                this.ongoingActionStatus = LoadingStatus.LOADED;
                this.ebookFile.coverImageKey = undefined;
                this.notificationService.show($localize`Cover image deleted successfully.`);
                this.dialogRef.close(true);
            },
            error: (err) => {
                this.handleError(err);
            }
        });
    }

    handleError(err: any) {
        this.dialogRef.disableClose = false;
        this.ongoingActionStatus = LoadingStatus.ERROR;

        if (JSON.stringify(err).includes("FileStorageQuotaExceededException")) {
            this.notificationService.show($localize`Failed to perform the operation. File storage quota exceeded.`);
        } else {
            this.notificationService.show($localize`Failed to perform the operation. Refresh the page and try again.`);
        }
    }

    protected readonly LoadingStatus = LoadingStatus;
}
