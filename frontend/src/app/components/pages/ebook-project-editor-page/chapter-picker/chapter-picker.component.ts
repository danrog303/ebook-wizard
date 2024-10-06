import {Component, EventEmitter, Input, Output} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList} from "@angular/cdk/drag-drop";
import EbookProjectChapter from "@app/models/ebook-project/ebook-project-chapter.model";
import {
    ChapterNameModalComponent
} from "@app/components/pages/ebook-project-editor-page/modals/chapter-name-modal/chapter-name-modal.component";
import ChapterDeleteModalComponent
    from "@app/components/pages/ebook-project-editor-page/modals/chapter-delete-modal/chapter-delete-modal.component";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import {MatDialog} from "@angular/material/dialog";
import {DatePipe, NgClass} from "@angular/common";
import {RouterLink} from "@angular/router";
import LoadingStatus from "@app/models/misc/loading-status.enum";

@Component({
    selector: 'app-chapter-picker',
    standalone: true,
    imports: [MaterialModule, CdkDropList, CdkDrag, NgClass, CdkDragPlaceholder, RouterLink, DatePipe],
    templateUrl: './chapter-picker.component.html',
    styleUrl: './chapter-picker.component.scss'
})
export class ChapterPickerComponent {
    @Input() ebookProject: EbookProject | null = null;
    @Input() chosenChapter: EbookProjectChapter | null = null;
    @Input() chosenChapterSaveStatus: LoadingStatus = LoadingStatus.NOT_STARTED ;
    @Input() chosenChapterLastSaved: null | Date = null;

    @Output() onChapterDragged = new EventEmitter<CdkDragDrop<any, any>>();
    @Output() onChapterSelected = new EventEmitter<EbookProjectChapter>();
    @Output() onGoBack = new EventEmitter<void>();
    @Output() onSave = new EventEmitter<void>();

    constructor(private matDialog: MatDialog) {
    }

    openAddChapterModal() {
        const modalRef = this.matDialog.open(ChapterNameModalComponent, {
            data: {
                ebookProject: this.ebookProject,
                chapter: null,
                mode: "create"
            }
        });

        modalRef.afterClosed().subscribe((chapter: EbookProjectChapter) => {
            if (chapter) {
                this.ebookProject!.chapters.push(chapter);
                this.chosenChapter = chapter;
            }
        });
    }

    openEditChapterNameModal(chapter: EbookProjectChapter) {
        const modalRef = this.matDialog.open(ChapterNameModalComponent, {
            data: {
                ebookProject: this.ebookProject,
                chapter: chapter,
                mode: "update"
            }
        });

        modalRef.afterClosed().subscribe((chapter: EbookProjectChapter) => {
            if (chapter) {
                const index = this.ebookProject!.chapters.findIndex(c => c.id === chapter.id);

                if (index !== -1) {
                    this.ebookProject!.chapters[index] = chapter;
                    this.chosenChapter = chapter;
                }
            }
        });
    }

    openDeleteChapterModal(chapter: EbookProjectChapter) {
        const modalRef = this.matDialog.open(ChapterDeleteModalComponent, {
            autoFocus: false,
            data: {
                ebookProject: this.ebookProject,
                ebookProjectChapter: chapter
            }
        });

        modalRef.afterClosed().subscribe((result: boolean | undefined) => {
            const index = this.ebookProject!.chapters.findIndex(c => c.id === chapter.id);

            if (index !== -1 && result === true) {
                this.ebookProject!.chapters.splice(index, 1);
                this.chosenChapter = this.ebookProject!.chapters[0] || null;
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
