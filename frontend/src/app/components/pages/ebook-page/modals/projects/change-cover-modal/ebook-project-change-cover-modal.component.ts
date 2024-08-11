import {Component, Inject} from '@angular/core';
import LoadingStatus from "@app/models/misc/loading-status.enum";
import {NgxFileDragDropComponent} from "ngx-file-drag-drop";
import {ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import EbookProjectService from "@app/services/ebook-project.service";
import UploadProgressEvent from "@app/models/misc/upload-progress-event.model";
import {Subscription} from "rxjs";
import NotificationService from "@app/services/notification.service";
import MaterialModule from "@app/modules/material.module";
import {NgClass} from "@angular/common";

@Component({
    selector: 'app-ebook-project-change-cover-modal',
    standalone: true,
    imports: [
        MaterialModule,
        NgxFileDragDropComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './ebook-project-change-cover-modal.component.html',
    styleUrl: './ebook-project-change-cover-modal.component.scss'
})
export class EbookProjectChangeCoverModalComponent {
    ongoingActionStatus: LoadingStatus = LoadingStatus.NOT_STARTED;
    coverImageUploadSubscription: Subscription | null = null;
    coverImageUploadProgress: number = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public ebookProject: EbookProject,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookProjectChangeCoverModalComponent>,
                private ebookProjectService: EbookProjectService,
                private notificationService: NotificationService) {
    }

    onFileChosen(files: File[]) {
        if (files.length === 0 || this.ongoingActionStatus !== LoadingStatus.NOT_STARTED) {
            return;
        }

        this.ongoingActionStatus = LoadingStatus.LOADING;
        this.dialogRef.disableClose = true;

        this.coverImageUploadSubscription = this.ebookProjectService.updateCoverImage(this.ebookProject.id, files[0]).subscribe({
            next: this.onUploadProgress.bind(this),
            error: () => {
                this.ongoingActionStatus = LoadingStatus.ERROR;
                this.notificationService.show('Failed to upload the file. Refresh the page and try again.');
                this.dialogRef.disableClose = false;
            }
        });
    }

    onUploadProgress(event: UploadProgressEvent<EbookProject>) {
        if (event.progress === 100 && event.result) {
            this.coverImageUploadSubscription?.unsubscribe();
            this.ongoingActionStatus = LoadingStatus.LOADED;
            this.ebookProject.coverImageKey = (event.result as EbookProject).coverImageKey;
            this.notificationService.show('Cover image updated successfully.');
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

        this.ebookProjectService.deleteCoverImage(this.ebookProject.id).subscribe({
            next: () => {
                this.ongoingActionStatus = LoadingStatus.LOADED;
                this.ebookProject.coverImageKey = undefined;
                this.notificationService.show('Cover image deleted successfully.');
                this.dialogRef.close(true);
            },
            error: () => {
                this.ongoingActionStatus = LoadingStatus.ERROR;
                this.notificationService.show('Failed to delete cover image. Refresh the page and try again.');
                this.dialogRef.disableClose = false;
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
