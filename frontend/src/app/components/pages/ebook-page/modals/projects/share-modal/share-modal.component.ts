import {Component, Inject, OnInit} from '@angular/core';
import {KeyValuePipe} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import MaterialModule from "@app/modules/material.module";
import NotificationService from "@app/services/notification.service";
import {MatCheckboxChange} from "@angular/material/checkbox";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import environment from "@env/environment";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import EbookProjectService from "@app/services/ebook-project.service";

@Component({
    selector: 'app-ebook-project-share-modal',
    standalone: true,
    imports: [MaterialModule, KeyValuePipe, ReactiveFormsModule],
    templateUrl: './share-modal.component.html',
    styleUrl: './share-modal.component.scss'
})
export class EbookProjectShareModalComponent implements OnInit {
    projectUrl: string = "";
    updatingStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    constructor(@Inject(MAT_DIALOG_DATA) public ebookProject: EbookProject,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookProjectShareModalComponent>,
                private ebookProjectService: EbookProjectService,
                private notificationService: NotificationService) {
    }

    ngOnInit() {
        this.projectUrl = `${environment.FRONTEND_BASE_URI}/reader/ebook-project/${this.ebookProject.id}`;
    }

    onPublicToggle(_: MatCheckboxChange) {
        this.updatingStatus = LoadingStatus.LOADING;
        this.ebookProject.isPublic = !this.ebookProject.isPublic;
        this.dialogRef.disableClose = true;

        this.ebookProjectService.updateEbookProject(this.ebookProject.id!, this.ebookProject).subscribe({
            next: () => {
                this.updatingStatus = LoadingStatus.LOADED;
                this.notificationService.show($localize`Ebook project updated`);
                this.dialogRef.disableClose = false;
            },
            error: () => {
                this.updatingStatus = LoadingStatus.ERROR;
                this.ebookProject.isPublic = !this.ebookProject.isPublic;
                this.notificationService.show($localize`Failed to update the ebook project`);
                this.dialogRef.disableClose = false;
            }
        });
    }

    async copyUrlToClipboard() {
        try {
            await navigator.clipboard.writeText(this.projectUrl);
            this.notificationService.show($localize`URL copied to clipboard`);
        } catch {
            this.notificationService.show($localize`Failed to copy URL to clipboard`);
        }
    }

    protected readonly LoadingStatus = LoadingStatus;
}
