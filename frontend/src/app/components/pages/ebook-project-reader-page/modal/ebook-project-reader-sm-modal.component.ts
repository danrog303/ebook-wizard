import {Component, Inject} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {CdkDrag, CdkDragPlaceholder} from "@angular/cdk/drag-drop";
import {RouterLink} from "@angular/router";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import EbookProjectChapter from "@app/models/ebook-project/ebook-project-chapter.model";
import {CommonModule} from "@angular/common";

export interface EbookProjectReaderSmModalProps {
    ebookProject: EbookProject;
    isUserAuthenticated: boolean;
    isUserOwner: boolean;
    chosenChapter: EbookProjectChapter;
    markChapterAsActive: (chapter: EbookProjectChapter) => void
}

@Component({
    selector: 'app-ebook-project-reader-sm-modal',
    standalone: true,
    imports: [MaterialModule, CdkDrag, RouterLink, CommonModule, CdkDragPlaceholder],
    templateUrl: './ebook-project-reader-sm-modal.component.html',
    styleUrl: './ebook-project-reader-sm-modal.component.scss'
})
export class EbookProjectReaderSmModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public props: EbookProjectReaderSmModalProps,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookProjectReaderSmModalComponent>) {
    }
}
