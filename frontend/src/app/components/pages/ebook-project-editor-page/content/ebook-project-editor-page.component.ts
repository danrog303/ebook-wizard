import {AfterContentInit, Component, HostListener, ViewChild} from '@angular/core';
import {ContentChange, QuillEditorComponent} from "ngx-quill";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import MaterialModule from "@app/modules/material.module";
import {catchError, map, Observable, Subscription} from "rxjs";
import EbookProject, {createEmptyEbookProject} from "@app/models/ebook-project/ebook-project.model";
import EbookProjectService from "@app/services/ebook-project.service";
import NotificationService from "@app/services/notification.service";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import EbookProjectChapter from "@app/models/ebook-project/ebook-project-chapter.model";
import {MatDialog} from "@angular/material/dialog";
import {CdkDragDrop, DragDropModule, moveItemInArray} from "@angular/cdk/drag-drop";
import EbookProjectChapterService from "@app/services/ebook-project-chapter.service";
import QuillIllustrationService, {ebookProjectIdForQuill, quillInstance} from "@app/services/quill-illustration.service";
import {
    ChapterPickerComponent
} from "@app/components/pages/ebook-project-editor-page/chapter-picker/chapter-picker.component";
import {
    ChapterPickerModalComponent
} from "@app/components/pages/ebook-project-editor-page/modals/chapter-picker-modal/chapter-picker-modal.component";

@Component({
    selector: 'app-ebook-project-editor-page',
    standalone: true,
    imports: [
        CommonModule,
        QuillEditorComponent,
        NgOptimizedImage,
        MaterialModule,
        RouterLink,
        DragDropModule,
        ChapterPickerComponent
    ],
    templateUrl: './ebook-project-editor-page.component.html',
    styleUrl: './ebook-project-editor-page.component.scss'
})
export class EbookProjectEditorPageComponent implements AfterContentInit {
    @ViewChild(QuillEditorComponent) quillEditor: QuillEditorComponent | null = null;
    routeSubscription: Subscription | null = null;
    saveTimeoutHandler: NodeJS.Timeout | null = null;

    ebookProject: EbookProject = createEmptyEbookProject();
    ebookProjectId: string = "";
    ebookProjectLoading: LoadingStatus = LoadingStatus.NOT_STARTED;

    chosenChapterSaveStatus: LoadingStatus = LoadingStatus.NOT_STARTED;
    chosenChapterLastSaved: Date | null = null;
    chosenChapter: EbookProjectChapter | null = null;

    constructor(private readonly activatedRoute: ActivatedRoute,
                private readonly ebookProjectService: EbookProjectService,
                private readonly ebookProjectChapterService: EbookProjectChapterService,
                private readonly notificationService: NotificationService,
                private readonly matDialog: MatDialog) {
    }

    async ngAfterContentInit() {
        this.routeSubscription = this.activatedRoute.params.subscribe(params => {
            this.ebookProjectId = params['id'];
            this.fetchEbookProject();
        });
    }

    fetchEbookProject() {
        this.ebookProjectLoading = LoadingStatus.LOADING;

        this.ebookProjectService.getEbookProject(this.ebookProjectId).subscribe({
            next: (ebookProject) => {
                this.ebookProject = ebookProject;
                this.ebookProjectLoading = LoadingStatus.LOADED;
                this.chosenChapter = this.ebookProject.chapters[0] || null;
            },
            error: () => {
                this.ebookProjectLoading = LoadingStatus.ERROR;
            }
        });
    }

    markChapterAsActive(chapter: EbookProjectChapter) {
        this.saveEbookProject().subscribe({
            next: () => {
                this.chosenChapter = chapter;

                if (this.quillEditor) {
                    const delta = this.quillEditor.quillEditor.clipboard.convert({html: chapter.contentHtml});
                    this.quillEditor.quillEditor.setContents(delta);
                    this.refreshImageElements();
                }
            },
            error: () => {
                this.notificationService.show($localize`Failed to save the chapter.`);
            }
        });
    }



    onChapterDragged(event: CdkDragDrop<EbookProjectChapter[]>) {
        moveItemInArray(this.ebookProject.chapters, event.previousIndex, event.currentIndex);
        this.ebookProjectChapterService.reorderChapters(this.ebookProjectId, event.previousIndex, event.currentIndex)
            .subscribe({
                error: () => {
                    this.notificationService.show($localize`Failed to reorder the chapters.`);
                },
                next: () => {
                    this.notificationService.show($localize`Chapters reordered successfully.`);
                }
            });
    }

    onTextInput($event: ContentChange) {
        if (this.chosenChapter) {
            this.chosenChapter.contentHtml = $event.html!;
        }
    }

    saveEbookProject(): Observable<void> {
        this.chosenChapterSaveStatus = LoadingStatus.LOADING;
        return this.ebookProjectChapterService
            .updateChapter(this.ebookProjectId, this.chosenChapter?.id ?? "", this.chosenChapter!)
            .pipe(
                map(() => {
                    this.chosenChapterSaveStatus = LoadingStatus.LOADED;
                    this.chosenChapterLastSaved = new Date();
                }),
                catchError((err) => {
                    if (JSON.stringify(err).includes("FileStorageQuotaExceededException")) {
                        this.notificationService.show($localize`Failed to save the chapter due to storage quota.`);
                    } else {
                        this.notificationService.show($localize`Failed to save the chapter.`);
                    }

                    this.chosenChapterSaveStatus = LoadingStatus.ERROR;
                    return new Observable<void>();
                })
            );
    }

    onQuillEditorCreated() {
        if (this.quillEditor && this.chosenChapter) {
            quillInstance.value = this.quillEditor.quillEditor;

            const delta = this.quillEditor.quillEditor.clipboard.convert({html: this.chosenChapter.contentHtml});
            this.quillEditor.quillEditor.setContents(delta);
            ebookProjectIdForQuill.value = this.ebookProjectId;

            this.refreshImageElements();
        }
    }

    refreshImageElements() {
        const imageElements = this.quillEditor!.quillEditor.root.querySelectorAll('img');
        imageElements.forEach((imageElement) => {

            const illustrationService = new QuillIllustrationService();
            const illustrationStub = imageElement.getAttribute('alt');

            if (illustrationStub) {
                illustrationService.getIllustrationImageUrl(this.ebookProjectId, illustrationStub)
                    .then((imageUrl) => {
                        imageElement.setAttribute('src', imageUrl);
                    });
            }
        });
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.saveEbookProject().subscribe();
        } else {
            if (this.saveTimeoutHandler) {
                clearTimeout(this.saveTimeoutHandler);
                this.saveTimeoutHandler = null;
            }

            this.saveTimeoutHandler = setTimeout(() => this.saveEbookProject().subscribe(), 500);
        }
    }

    openChapterPickerModal() {
        this.matDialog.open(ChapterPickerModalComponent, {
            data: {
                ebookProject: this.ebookProject,
                chosenChapter: this.chosenChapter,
                chosenChapterSaveStatus: this.chosenChapterSaveStatus,
                chosenChapterLastSaved: this.chosenChapterLastSaved,
                onChapterDragged: this.onChapterDragged.bind(this),
                onChapterSelected: this.markChapterAsActive.bind(this),
                onSave: () => this.saveEbookProject().subscribe()
            },
            autoFocus: false
        });

    }

    protected readonly LoadingStatus = LoadingStatus;
    protected readonly document = document;
}
