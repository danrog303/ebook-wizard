import {Component, Inject, Input} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

import EbookProjectChapter from "@app/models/ebook-project/ebook-project-chapter.model";
import EbookProject, {createEmptyEbookProject} from "@app/models/ebook-project/ebook-project.model";
import MaterialModule from "@app/modules/material.module";
import EbookProjectChapterService from "@app/services/ebook-project-chapter.service";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import NotificationService from "@app/services/notification.service";
import structuredClone from "@ungap/structured-clone";

export interface ChapterNameModalComponentData {
    ebookProject: EbookProject;
    chapter: EbookProjectChapter | null;
    mode: "create" | "update";
}

@Component({
    selector: 'app-chapter-name-modal',
    standalone: true,
    templateUrl: './chapter-name-modal.component.html',
    styleUrl: './chapter-name-modal.component.scss',
    imports: [
        MaterialModule, ReactiveFormsModule
    ]
})
export class ChapterNameModalComponent {
    ebookProject: EbookProject = createEmptyEbookProject();
    chapter: EbookProjectChapter | null = null;
    mode: "create" | "update" = "create";

    chapterForm = new FormGroup({
        name: new FormControl("", [Validators.required, Validators.minLength(2)])
    });

    constructor(@Inject(MAT_DIALOG_DATA) dialogData: ChapterNameModalComponentData,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<ChapterNameModalComponent>,
                private ebookProjectChapterService: EbookProjectChapterService,
                private notificationService: NotificationService) {
        this.ebookProject = dialogData.ebookProject;
        this.chapter = dialogData.chapter;
        this.mode = dialogData.mode;
        this.chapterForm.patchValue({
            name: this.chapter?.name ?? ""
        });
    }

    onChapterSaved() {
        if (this.mode === "create") {
            this.chapterCreate();
        } else if (this.mode === "update") {
            this.chapterUpdate();
        }
    }

    private chapterUpdate() {
        const chapter = structuredClone(this.chapter!);
        chapter.name = this.chapterForm.value.name as string;

        this.ebookProjectChapterService.updateChapter(this.ebookProject.id, this.chapter!.id, chapter).subscribe({
            next: (chapter: EbookProjectChapter) => {
                this.dialogRef.close(chapter);
            },
            error: () => {
                this.notificationService.show($localize`Failed to update a chapter.`);
            }
        });
    }

    private chapterCreate() {
        const chapter: EbookProjectChapter = {
            id: "",
            name: this.chapterForm.value.name as string,
            contentHtml: "",
            creationDate: new Date(),
            lastModifiedDate: new Date()
        };

        this.ebookProjectChapterService.createChapter(this.ebookProject.id, chapter).subscribe({
            next: (chapter: EbookProjectChapter) => {
                this.dialogRef.close(chapter);
            },
            error: () => {
                this.notificationService.show($localize`Failed to create a chapter.`);
            }
        });
    }
}
