import {Component, Inject} from '@angular/core';
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
    ongoingActionStatus: LoadingStatus = LoadingStatus.NOT_STARTED;
    coverImageUploadSubscription: Subscription | null = null;
    coverImageUploadProgress: number = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public ebookFile: EbookFile,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookFileChangeCoverModalComponent>,
                private ebookFileService: EbookFileService,
                private notificationService: NotificationService) {
    }

    onFileChosen(files: File[]) {
        if (files.length === 0 || this.ongoingActionStatus !== LoadingStatus.NOT_STARTED) {
            return;
        }

        this.ongoingActionStatus = LoadingStatus.LOADING;

        this.coverImageUploadSubscription = this.ebookFileService.updateEbookFileCoverImage(files[0], this.ebookFile.id!).subscribe({
            next: this.onUploadProgress.bind(this),
            error: () => {
                this.ongoingActionStatus = LoadingStatus.ERROR;
                this.notificationService.show('Failed to upload the file. Refresh the page and try again.');
            }
        });
    }

    onUploadProgress(event: UploadProgressEvent<EbookFile>) {
        if (event.progress === 100 && event.result) {
            this.coverImageUploadSubscription?.unsubscribe();
            this.ongoingActionStatus = LoadingStatus.LOADED;
            this.ebookFile.coverImageKey = (event.result as EbookFile).coverImageKey;
            this.notificationService.show('Cover image updated successfully.');
            this.dialogRef.close();
        } else {
            this.ongoingActionStatus = LoadingStatus.LOADING;
            this.coverImageUploadProgress = event.progress;
        }
    }

    onDeleteCoverImage() {
        this.ongoingActionStatus = LoadingStatus.LOADING;
        this.coverImageUploadProgress = 100;

        this.ebookFileService.deleteCoverImage(this.ebookFile.id!).subscribe({
            next: () => {
                this.ongoingActionStatus = LoadingStatus.LOADED;
                this.ebookFile.coverImageKey = undefined;
                this.notificationService.show('Cover image deleted successfully.');
                this.dialogRef.close();
            },
            error: () => {
                this.ongoingActionStatus = LoadingStatus.ERROR;
                this.notificationService.show('Failed to delete cover image. Refresh the page and try again.');
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
