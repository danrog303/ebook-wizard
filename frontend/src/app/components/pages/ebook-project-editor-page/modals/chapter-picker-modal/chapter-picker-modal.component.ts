import {Component, Inject} from '@angular/core';
import {ChapterPickerComponent} from "@app/components/pages/ebook-project-editor-page/chapter-picker/chapter-picker.component";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import EbookProjectChapter from "@app/models/ebook-project/ebook-project-chapter.model";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import LoadingStatus from "@app/models/misc/loading-status.enum";

export interface ChapterPickerModalComponentData {
    chosenChapterLastSaved: Date | null;
    chosenChapterSaveStatus: LoadingStatus;
    ebookProject: EbookProject;
    chosenChapter: EbookProjectChapter;
    onChapterDragged: (event: CdkDragDrop<any, any>) => void;
    onChapterSelected: (chapter: EbookProjectChapter) => void;
    onSave: () => void;
}

@Component({
    selector: 'app-chapter-picker-modal',
    standalone: true,
    imports: [ChapterPickerComponent],
    templateUrl: './chapter-picker-modal.component.html',
    styleUrl: './chapter-picker-modal.component.scss'
})
export class ChapterPickerModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public dialogData: ChapterPickerModalComponentData,
                @Inject(MatDialogRef) public dialogRef: MatDialogRef<ChapterPickerModalComponent>) {
    }
}
