import {Component, ViewChild} from '@angular/core';
import {EbookFileDetailsComponent} from "@app/components/common/ebook-file-details/ebook-file-details.component";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {
    EbookProjectMetaEditFormComponent
} from "@app/components/common/ebook-project-meta-edit-form/ebook-project-meta-edit-form.component";
import EbookProject, {createEmptyEbookProject} from "@app/models/ebook-project/ebook-project.model";
import MaterialModule from "@app/modules/material.module";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import {MatStepper} from "@angular/material/stepper";
import EbookFileMetaEditFormComponent
    from "@app/components/common/ebook-file-meta-edit-form/ebook-file-meta-edit-form.component";
import EbookProjectService from "@app/services/ebook-project.service";
import NotificationService from "@app/services/notification.service";
import UploadProgressEvent from "@app/models/misc/upload-progress-event.model";
import {Subscription} from "rxjs";
import {
    EbookProjectDetailsComponent
} from "@app/components/common/ebook-project-details/ebook-project-details.component";
import {NgxFileDragDropComponent} from "ngx-file-drag-drop";

@Component({
    selector: 'app-create-ebook-project-modal',
    standalone: true,
    imports: [
        EbookFileDetailsComponent,
        EbookFileMetaEditFormComponent,
        MaterialModule,
        NgxFileDragDropComponent,
        ReactiveFormsModule,
        RouterLink,
        EbookProjectMetaEditFormComponent,
        EbookProjectDetailsComponent
    ],
    templateUrl: './create-ebook-project-modal.component.html',
    styleUrl: './create-ebook-project-modal.component.scss'
})
export class CreateEbookProjectModalComponent {
    @ViewChild("stepper") stepper: MatStepper | null = null;

    ebookProject: EbookProject = createEmptyEbookProject();
    ebookProjectCreated = false;

    coverImageUploadSubscription: Subscription | null = null;
    coverImageUploadProgress = 0;
    coverImageUploadStatus: LoadingStatus = LoadingStatus.NOT_STARTED;
    coverUploadForm = new FormGroup({
        file: new FormControl(null, []),
    });

    constructor(private ebookProjectService: EbookProjectService,
                private notificationService: NotificationService) {
    }

    onEbookProjectCreated(ebookProject: EbookProject) {
        this.ebookProject = ebookProject;
        this.stepper?.next();
        this.ebookProjectCreated = true;
    }

    onFileChosen(files: File[]) {
        if (files.length === 0 || this.coverImageUploadStatus !== LoadingStatus.NOT_STARTED) {
            return;
        }

        this.coverImageUploadStatus = LoadingStatus.LOADING;

        this.coverImageUploadSubscription = this.ebookProjectService.updateCoverImage(this.ebookProject.id, files[0]).subscribe({
            next: this.onUploadProgress.bind(this),
            error: () => {
                this.coverImageUploadStatus = LoadingStatus.ERROR;
                this.notificationService.show('Failed to upload the file. Refresh the page and try again.');
            }
        });
    }

    onUploadProgress(event: UploadProgressEvent<EbookProject>) {
        if (event.progress === 100 && event.result) {
            this.coverImageUploadSubscription?.unsubscribe();
            this.coverImageUploadStatus = LoadingStatus.LOADED;
            this.ebookProject = event.result;
            this.stepper?.next();
        } else {
            this.coverImageUploadStatus = LoadingStatus.LOADING;
            this.coverImageUploadProgress = event.progress;
        }
    }

    protected readonly LoadingStatus = LoadingStatus;
}
