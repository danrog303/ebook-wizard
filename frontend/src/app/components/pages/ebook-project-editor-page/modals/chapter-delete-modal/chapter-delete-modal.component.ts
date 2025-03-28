import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import MaterialModule from "@app/modules/material.module";
import EbookProjectChapter from "@app/models/ebook-project/ebook-project-chapter.model";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import NotificationService from "@app/services/notification.service";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import EbookProjectChapterService from "@app/services/ebook-project-chapter.service";

export interface ChapterDeleteModalData {
    ebookProject: EbookProject,
    ebookProjectChapter: EbookProjectChapter
}

@Component({
    selector: 'app-chapter-delete-modal',
    standalone: true,
    templateUrl: './chapter-delete-modal.component.html',
    styleUrl: './chapter-delete-modal.component.scss',
    imports: [
        ActionPendingButtonComponent,
        MaterialModule
    ]
})
export default class ChapterDeleteModalComponent {
    ebookProject: EbookProject;
    ebookProjectChapter: EbookProjectChapter;

    deleteStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    constructor(@Inject(MAT_DIALOG_DATA) dialogData: ChapterDeleteModalData,
                @Inject(MatDialogRef) private readonly dialogRef: MatDialogRef<ChapterDeleteModalComponent>,
                private readonly ebookProjectChapterService: EbookProjectChapterService,
                private readonly notificationService: NotificationService) {
        this.ebookProject = dialogData.ebookProject;
        this.ebookProjectChapter = dialogData.ebookProjectChapter;
    }

    onDeleteChapter() {
        this.deleteStatus = LoadingStatus.LOADING;
        this.ebookProjectChapterService.deleteChapter(this.ebookProject.id, this.ebookProjectChapter.id).subscribe({
            next: () => {
                this.notificationService.show($localize`Chapter deleted.`);
                this.dialogRef.close(true);
                this.deleteStatus = LoadingStatus.LOADED;
            },
            error: () => {
                this.notificationService.show($localize`Failed to delete the chapter.`);
                this.deleteStatus = LoadingStatus.ERROR;
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
