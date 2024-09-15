import {Component, ViewChild} from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgxFileDragDropComponent} from "ngx-file-drag-drop";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatStepper} from "@angular/material/stepper";
import {Subscription} from "rxjs";
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

@Component({
    selector: 'app-import-modal',
    standalone: true,
    imports: [
        MaterialModule, RouterLink, NgxFileDragDropComponent,
        ReactiveFormsModule, ActionPendingButtonComponent,
        CommonModule, EbookFileDetailsComponent, EbookFileMetaEditFormComponent
    ],
    templateUrl: './ebook-file-import-modal.component.html',
    styleUrl: './ebook-file-import-modal.component.scss'
})
export class EbookFileImportModalComponent {
    @ViewChild("stepper") stepper: MatStepper | null = null;

    ebookFile: EbookFile | null = null;
    ebookFileUploadStatus = LoadingStatus.NOT_STARTED;
    ebookFileUploadProgress = 0;
    ebookFileUploadSubscription: Subscription | null = null;

    fileUploadForm = new FormGroup({
        file: new FormControl(null, [Validators.required]),
    });

    constructor(private ebookFileService: EbookFileService,
                private notificationService: NotificationService) {
    }

    onFileChosen(files: File[]) {
        if (files.length === 0 || this.ebookFileUploadStatus !== LoadingStatus.NOT_STARTED) {
            return;
        }

        this.ebookFileUploadStatus = LoadingStatus.LOADING;
        this.ebookFileUploadSubscription = this.ebookFileService.importEbookFromFile(files[0]).subscribe({
            next: this.onUploadProgress.bind(this),
            error: () => {
                this.ebookFileUploadStatus = LoadingStatus.ERROR;
                this.notificationService.show($localize`Failed to upload the file. Refresh the page and try again.`);
            }
        });
    }

    onEbookFileMetaUpdated(ebookFile: EbookFile) {
        this.ebookFile = ebookFile;
        this.stepper?.next();
    }

    onUploadProgress(event: UploadProgressEvent<EbookFile>) {
        if (event.progress === 100 && event.result) {
            this.ebookFileUploadSubscription?.unsubscribe();
            this.ebookFileUploadStatus = LoadingStatus.LOADED;
            this.ebookFile = event.result;
            this.stepper?.next();
        } else {
            this.ebookFileUploadStatus = LoadingStatus.LOADING;
            this.ebookFileUploadProgress = event.progress;
        }
    }

    protected readonly LoadingStatus = LoadingStatus;
}
