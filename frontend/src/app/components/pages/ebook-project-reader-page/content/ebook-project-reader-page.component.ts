import {AfterContentInit, AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {QuillEditorComponent, QuillModule} from "ngx-quill";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import MaterialModule from "@app/modules/material.module";
import EbookProject, {createEmptyEbookProject} from "@app/models/ebook-project/ebook-project.model";
import EbookProjectService from "@app/services/ebook-project.service";
import NotificationService from "@app/services/notification.service";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import EbookProjectChapter from "@app/models/ebook-project/ebook-project-chapter.model";
import {DragDropModule} from "@angular/cdk/drag-drop";
import QuillIllustrationService, {ebookProjectIdForQuill, quillInstance} from "@app/services/quill-illustration.service";
import AuthenticationService from "@app/services/authentication.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {
    EbookProjectReaderSmModalComponent
} from "@app/components/pages/ebook-project-reader-page/modal/ebook-project-reader-sm-modal.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-ebook-project-reader-page',
    standalone: true,
    imports: [
        CommonModule,
        QuillEditorComponent,
        NgOptimizedImage,
        MaterialModule,
        RouterLink,
        DragDropModule
    ],
    templateUrl: './ebook-project-reader-page.component.html',
    styleUrl: './ebook-project-reader-page.component.scss'
})
export class EbookProjectReaderPageComponent implements OnInit, AfterContentInit {
    ebookProject: EbookProject = createEmptyEbookProject();
    ebookProjectId: string = "";
    ebookProjectLoadStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    chosenChapter: EbookProjectChapter | null = null;

    isUserAuthenticated: boolean | null = null;
    isUserOwner: boolean | null = null;

    smallScreenMode: boolean = false;

    @ViewChild("viewPaneIframe") viewPaneIframe: HTMLIFrameElement | undefined;

    constructor(private activatedRoute: ActivatedRoute,
                private ebookProjectService: EbookProjectService,
                private matDialog: MatDialog,
                private authService: AuthenticationService,
                private breakpointObserver: BreakpointObserver) {
    }

    async ngOnInit() {
        this.breakpointObserver.observe('(max-width: 768px)').subscribe(result => {
            this.smallScreenMode = result.matches;
        });
    }

    async ngAfterContentInit() {
        this.activatedRoute.params.subscribe(async (params) => {
            this.ebookProjectId = params['id'];
            await this.fetchEbookProject();
        });

        this.isUserAuthenticated = await this.authService.isUserAuthenticated();
    }

    async fetchEbookProject() {
        this.ebookProjectLoadStatus = LoadingStatus.LOADING;
        this.ebookProjectService.getEbookProject(this.ebookProjectId).subscribe({
            next: async (ebookProject) => {
                this.ebookProject = ebookProject;
                this.ebookProjectLoadStatus = LoadingStatus.LOADED;
                this.chosenChapter = this.ebookProject.chapters[0] || null;
                this.isUserOwner = await this.authService.getUserId() === this.ebookProject.ownerUserId;
                await this.refreshImageElements();
            },
            error: () => {
                this.ebookProjectLoadStatus = LoadingStatus.ERROR;
            }
        });
    }

    markChapterAsActive(chapter: EbookProjectChapter) {
        this.chosenChapter = chapter;
        this.refreshImageElements().then();
    }

    async refreshImageElements() {
        if (typeof DOMParser === 'undefined') {
            return;
        }

        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(this.chosenChapter!.contentHtml, 'text/html');
        const imageElements = htmlDoc.querySelectorAll('img');

        for (let i = 0; i < imageElements.length; i++) {
            const imageElement = imageElements[i];
            const illustrationService = new QuillIllustrationService();
            const illustrationStub = imageElement.getAttribute('alt');

            if (illustrationStub) {
                const imageUrl = await illustrationService.getIllustrationImageUrl(this.ebookProjectId, illustrationStub);
                imageElement.setAttribute('src', imageUrl);
            }
        }

        this.chosenChapter!.contentHtml = htmlDoc.body.innerHTML;
        if (this.viewPaneIframe) {
            this.viewPaneIframe!.srcdoc = this.chosenChapter!.contentHtml;
        }
    }

    refreshPage() {
        window.location.reload();
    }

    showSmallScreenModal() {
        const dialogRef = this.matDialog.open(EbookProjectReaderSmModalComponent, {
            data: {
                ebookProject: this.ebookProject,
                isUserAuthenticated: this.isUserAuthenticated!,
                isUserOwner: this.isUserOwner!,
                chosenChapter: this.chosenChapter!,
                markChapterAsActive: (chapter: EbookProjectChapter) => {
                    dialogRef.close();
                    this.markChapterAsActive.bind(chapter);
                }
            },
            autoFocus: false
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
