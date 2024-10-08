import {Component, Inject, ViewChild} from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgxFileDragDropComponent} from "ngx-file-drag-drop";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatStepper} from "@angular/material/stepper";
import {catchError, concatMap, from, of, Subscription, tap, throwError} from "rxjs";
import {CommonModule} from "@angular/common";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import MaterialModule from "@app/modules/material.module";
import {EbookFileDetailsComponent} from "../../../../../common/ebook-file-details/ebook-file-details.component";
import EbookFileMetaEditFormComponent from "@app/components/common/ebook-file-meta-edit-form/ebook-file-meta-edit-form.component";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import EbookFileService from "@app/services/ebook-file.service";
import NotificationService from "@app/services/notification.service";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import UploadProgressEvent from "@app/models/misc/upload-progress-event.model";
import {MatTooltip} from "@angular/material/tooltip";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: 'app-import-modal',
    standalone: true,
    imports: [
        MaterialModule, RouterLink, NgxFileDragDropComponent,
        ReactiveFormsModule, ActionPendingButtonComponent,
        CommonModule, EbookFileDetailsComponent, EbookFileMetaEditFormComponent, MatTooltip
    ],
    templateUrl: './ebook-file-import-modal.component.html',
    styleUrl: './ebook-file-import-modal.component.scss'
})
export class EbookFileImportModalComponent {
    @ViewChild("stepper") stepper: MatStepper | null = null;

    uploadedEbookFiles: EbookFile[] = [];
    ebookFileUploadStatus = LoadingStatus.NOT_STARTED;
    ebookFileUploadProgress = 0;
    ebookFileUploadSubscription: Subscription | null = null;

    // True, when user is uploading multiple files at once
    multiMode: boolean = false;
    multiModeProgressedFilesCount = 0;
    multiModeFilesCount = 0;

    fileUploadForm = new FormGroup({
        file: new FormControl(null, [Validators.required]),
    });

    constructor(@Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookFileImportModalComponent>,
                private ebookFileService: EbookFileService,
                private notificationService: NotificationService) {
    }

    onFileChosen(files: File[]) {
        if (files.length === 0 || this.ebookFileUploadStatus !== LoadingStatus.NOT_STARTED) {
            // When no files selected, don't do anything
            return;
        } else if (files.length === 1) {
            // When exactly one file selected, upload it to the server
            // And go to the detailed editor
            this.dialogRef.disableClose = true;
            this.ebookFileUploadStatus = LoadingStatus.LOADING;
            this.ebookFileUploadSubscription = this.ebookFileService.importEbookFromFile(files[0]).subscribe({
                next: this.onUploadProgress.bind(this),
                error: () => {
                    this.ebookFileUploadStatus = LoadingStatus.ERROR;
                    this.notificationService.show($localize`Failed to upload the file. Refresh the page and try again.`);
                }
            });
        } else {
            // When multiple files selected, upload all of them to the server and close the modal
            this.multiMode = true;
            this.dialogRef.disableClose = true;
            this.multiModeProgressedFilesCount = 0;
            this.multiModeFilesCount = files.length;

            this.ebookFileUploadSubscription = from(files).pipe(
                concatMap(file => this.ebookFileService.importEbookFromFile(file))
            ).subscribe({
                next: this.onUploadProgress.bind(this),
                error: () => {
                    this.ebookFileUploadStatus = LoadingStatus.ERROR;
                    this.notificationService.show($localize`Failed to upload the file. Refresh the page and try again.`);
                }
            });
        }
    }

    onEbookFileMetaUpdated(ebookFile: EbookFile) {
        this.uploadedEbookFiles[0] = ebookFile;
        this.stepper?.next();
    }

    onUploadProgress(event: UploadProgressEvent<EbookFile>) {
        if (event.progress === 100 && event.result) {
            this.ebookFileUploadStatus = LoadingStatus.LOADED;
            this.uploadedEbookFiles.push(event.result);

            if (this.multiMode) {
                this.multiModeProgressedFilesCount++;

                if (this.multiModeProgressedFilesCount >= this.multiModeFilesCount) {
                    this.dialogRef.close();
                    this.notificationService.show($localize`All files uploaded successfuly.`);
                }
            } else {
                this.ebookFileUploadSubscription?.unsubscribe();
                this.dialogRef.disableClose = false;
                this.stepper?.next();
            }
        } else {
            this.ebookFileUploadStatus = LoadingStatus.LOADING;
            this.ebookFileUploadProgress = event.progress;
        }
    }

    protected readonly LoadingStatus = LoadingStatus;
}
