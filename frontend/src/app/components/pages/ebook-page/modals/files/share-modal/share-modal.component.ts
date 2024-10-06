import {Component, Inject, OnInit} from '@angular/core';
import {KeyValuePipe} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import MaterialModule from "@app/modules/material.module";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import EbookFileService from "@app/services/ebook-file.service";
import NotificationService from "@app/services/notification.service";
import {MatCheckboxChange} from "@angular/material/checkbox";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import environment from "@env/environment";

@Component({
    selector: 'app-ebook-file-share-modal',
    standalone: true,
    imports: [MaterialModule, KeyValuePipe, ReactiveFormsModule],
    templateUrl: './share-modal.component.html',
    styleUrl: './share-modal.component.scss'
})
export class EbookFileShareModalComponent implements OnInit {
    ebookUrl: string = "";
    updatingStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    constructor(@Inject(MAT_DIALOG_DATA) public ebookFile: EbookFile,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookFileShareModalComponent>,
                private ebookFileService: EbookFileService,
                private notificationService: NotificationService) {
    }

    ngOnInit() {
        if (window.location.href.includes(environment.FRONTEND_BASE_URI_PL)) {
            this.ebookUrl = `${environment.FRONTEND_BASE_URI_PL}/reader/ebook-file/${this.ebookFile.id}`;
        } else {
            this.ebookUrl = `${environment.FRONTEND_BASE_URI_EN}/reader/ebook-file/${this.ebookFile.id}`;
        }
    }

    onPublicToggle(event: MatCheckboxChange) {
        this.updatingStatus = LoadingStatus.LOADING;
        this.ebookFile.public = !this.ebookFile.public;
        this.dialogRef.disableClose = true;

        this.ebookFileService.updateEbookFile(this.ebookFile.id!, this.ebookFile).subscribe({
            next: () => {
                this.updatingStatus = LoadingStatus.LOADED;
                this.notificationService.show($localize`Ebook file updated`);
                this.dialogRef.disableClose = false;
            },
            error: () => {
                this.updatingStatus = LoadingStatus.ERROR;
                this.ebookFile.public = !this.ebookFile.public;
                this.notificationService.show($localize`Failed to update the ebook file`);
                this.dialogRef.disableClose = false;
            }
        });
    }

    async copyUrlToClipboard() {
        try {
            await navigator.clipboard.writeText(this.ebookUrl);
            this.notificationService.show($localize`URL copied to clipboard`);
        } catch {
            this.notificationService.show($localize`Failed to copy URL to clipboard`);
        }
    }

    protected readonly LoadingStatus = LoadingStatus;
}
