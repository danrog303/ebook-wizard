import {AfterContentInit, AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatMenuTrigger} from "@angular/material/menu";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";

import NotificationService from "@app/services/notification.service";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import EbookProjectService from "@app/services/ebook-project.service";
import MaterialModule from "@app/modules/material.module";
import {EbookFileDetailsComponent} from "@app/components/common/ebook-file-details/ebook-file-details.component";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import {EbookProjectDeleteModalComponent} from "@app/components/pages/ebook-page/modals/projects/delete-modal/ebook-project-delete-modal.component";
import {CreateEbookProjectModalComponent} from "@app/components/pages/ebook-page/modals/projects/create-modal/create-ebook-project-modal.component";
import {EbookProjectDetailsComponent} from "@app/components/common/ebook-project-details/ebook-project-details.component";
import {EbookProjectMetaEditModal} from "@app/components/pages/ebook-page/modals/projects/meta-edit-modal/meta-edit-modal.component";
import {EbookProjectDownloadModalComponent} from "@app/components/pages/ebook-page/modals/projects/download-modal/ebook-project-download-modal.component";
import {EbookProjectChangeCoverModalComponent} from "@app/components/pages/ebook-page/modals/projects/change-cover-modal/ebook-project-change-cover-modal.component";
import {ConvertEbookProjectToFileModalComponent} from "@app/components/pages/ebook-page/modals/projects/convert-to-file-modal/convert-to-file-modal.component";
import {EbookProjectSendToReaderModalComponent} from "@app/components/pages/ebook-page/modals/projects/send-to-reader-modal/send-to-reader-modal.component";
import {EbookProjectShareModalComponent} from "@app/components/pages/ebook-page/modals/projects/share-modal/share-modal.component";
import {FormsModule} from "@angular/forms";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

@Component({
    selector: 'app-ebook-page-projects-section',
    standalone: true,
    imports: [MaterialModule, EbookFileDetailsComponent, CommonModule, EbookProjectDetailsComponent, FormsModule],
    templateUrl: './ebook-page-projects-section.component.html',
    styleUrl: './ebook-page-projects-section.component.scss'
})
export class EbookPageProjectsSectionComponent implements AfterContentInit {
    ebookProjects: EbookProject[] = [];
    ebookProjectsLoading: LoadingStatus = LoadingStatus.NOT_STARTED;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | null = null;
    @ViewChildren('ebookProjectDropdownTrigger') ebookProjectDropdownMenus: QueryList<MatMenuTrigger> | null = null;
    selectedEbookProject: EbookProject | null = null;

    ebookProjectsSorted: EbookProject[] = [];
    filterKeyword: string = "";
    sortBy: string = "";

    constructor(private ebookProjectService: EbookProjectService,
                private notificationService: NotificationService,
                private dialogService: MatDialog,
                private router: Router,
                private activatedRoute: ActivatedRoute) {
    }

    ngAfterContentInit() {
        this.sortBy = sessionStorage.getItem('ebookProjectsSortBy') ?? 'sort_creation_date';
        this.filterKeyword = sessionStorage.getItem('ebookProjectsFilterKeyword') ?? '';

        if (this.paginator) {
            this.paginator._intl.itemsPerPageLabel = $localize`Projects per page`;
            this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
                if (length === 0 || pageSize === 0) {
                    return $localize`0 of ${length}`;
                }

                length = Math.max(length, 0);

                const startIndex = page * pageSize;

                const endIndex = startIndex < length ?
                    Math.min(startIndex + pageSize, length) :
                    startIndex + pageSize;

                return $localize`${startIndex + 1} – ${endIndex} of ${length}`;
            }
        }

        this.refreshEbookProjects();
        this.activatedRoute.queryParamMap.subscribe((params) => {
            const activeModal = params.get('modal');
            if (activeModal === 'creator') {
                this.openCreateProjectModal();
            }
        });
    }

    refreshEbookProjects() {
        this.ebookProjectsLoading = LoadingStatus.LOADING;
        this.ebookProjectService.listEbookProjectsOfAuthenticatedUser().subscribe({
            next: (ebookProjects: EbookProject[]) => {
                let activeEbookIndex = -1;
                if (this.selectedEbookProject) {
                    activeEbookIndex = this.ebookProjects.indexOf(this.selectedEbookProject);
                }

                this.ebookProjects = ebookProjects;
                this.ebookProjectsLoading = LoadingStatus.LOADED;

                if (this.selectedEbookProject) {
                    this.selectedEbookProject = this.ebookProjects[activeEbookIndex];
                }

                this.applySortAndFilter();
            },
            error: () => {
                this.ebookProjectsLoading = LoadingStatus.ERROR;
                this.notificationService.show($localize`Failed to load ebook projects. Refresh the page and try again.`);
            }
        });
    }

    openEditPage(ebookProject: EbookProject) {
        this.router.navigate(['/editor/ebook-project/', ebookProject.id]).then();
    }

    openCreateProjectModal() {
        const dialogRef = this.dialogService.open(CreateEbookProjectModalComponent, {
            autoFocus: false,
        });

        dialogRef.afterClosed().subscribe(() => {
            if (dialogRef.componentInstance.ebookProjectCreated) {
                this.ebookProjects.push(dialogRef.componentInstance.ebookProject!);
                this.applySortAndFilter();
            }
        });
    }

    openDeleteModal(ebookProject: EbookProject) {
        const modalRef = this.dialogService.open(EbookProjectDeleteModalComponent, {
            autoFocus: false,
            data: ebookProject
        });

        modalRef.afterClosed().subscribe((result: boolean | undefined) => {
            if (result === true) {
                this.onProjectDeleted(ebookProject);
            }
        });
    }

    openEbookProjectDropdownMenu(event: MouseEvent, index: number) {
        event.preventDefault();
        this.ebookProjectDropdownMenus?.get(index)?.openMenu();
    }

    markEbookProjectAsSelected(index: number) {
        this.selectedEbookProject = this.ebookProjectsSorted[index];
    }

    onProjectDeleted(ebookProject: EbookProject) {
        this.ebookProjects = this.ebookProjects.filter((project) => project.id !== ebookProject.id);
        this.applySortAndFilter();
    }

    openEditMetaModal(ebookProject: EbookProject) {
        const modalRef = this.dialogService.open(EbookProjectMetaEditModal, {
            autoFocus: false,
            data: ebookProject
        });

        modalRef.afterClosed().subscribe((result: EbookProject | undefined) => {
            if (result !== undefined) {
                this.ebookProjects = this.ebookProjects.map((project) => {
                    if (project.id === result.id) {
                        return result;
                    }

                    return project;
                });

                this.applySortAndFilter();
                this.selectedEbookProject = result;
            }
        });
    }

    openDownloadModal(ebookProject: EbookProject) {
        const modalRef = this.dialogService.open(EbookProjectDownloadModalComponent, {
            autoFocus: false,
            data: ebookProject
        });

        modalRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.refreshEbookProjects();
            }
        });
    }

    openChangeCoverModal(ebookProject: EbookProject) {
        const modalRef = this.dialogService.open(EbookProjectChangeCoverModalComponent, {
            autoFocus: false,
            data: ebookProject,
        });

        modalRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.refreshEbookProjects();
            }
        });
    }

    openConvertToEbookFileModal(ebookProject: EbookProject) {
        const modalRef = this.dialogService.open(ConvertEbookProjectToFileModalComponent, {
            autoFocus: false,
            data: ebookProject
        });
    }

    openSendToReaderModal(ebookProject: EbookProject) {
        this.dialogService.open(EbookProjectSendToReaderModalComponent, {
            data: ebookProject
        });
    }

    openShareModal(ebookProject: EbookProject) {
        this.dialogService.open(EbookProjectShareModalComponent, {
            data: ebookProject
        });
    }

    applySortAndFilter() {
        sessionStorage.setItem('ebookProjectsSortBy', this.sortBy);
        sessionStorage.setItem('ebookProjectsFilterKeyword', this.filterKeyword);

        this.ebookProjectsSorted = this.ebookProjects.filter((project) => {
            if (this.filterKeyword === "") {
                return true;
            }

            return project.name.toLowerCase().includes(this.filterKeyword.toLowerCase()) ||
                project.description?.toLowerCase().includes(this.filterKeyword.toLowerCase()) ||
                project.author?.toLowerCase().includes(this.filterKeyword.toLowerCase()) ||
                project.tags.some((tag) => tag.toLowerCase().includes(this.filterKeyword.toLowerCase()));
        }).sort((a, b) => {
            if (this.sortBy === 'sort_title') {
                return a.name.localeCompare(b.name);
            }

            if (this.sortBy === 'sort_chapters_count') {
                return a.chapters.length - b.chapters.length;
            }

            if (this.sortBy === 'sort_creation_date') {
                return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
            }

            if (this.sortBy === 'sort_author' && a.hasOwnProperty('author') && b.hasOwnProperty('author')) {
                return a.author!.localeCompare(b.author!);
            }

            return 0;
        });

        this.paginator!.length = this.ebookProjectsSorted.length;
        this.ebookProjectsSorted = this.ebookProjectsSorted.slice(this.paginator!.pageIndex * this.paginator!.pageSize, (this.paginator!.pageIndex + 1) * this.paginator!.pageSize);

        // Reset to first page if the current page is out of bounds
        if (this.paginator!.pageIndex > this.paginator!.getNumberOfPages() - 1) {
            this.paginator!.pageIndex = 0;
        }
    }

    handlePageChange(pageEvent: PageEvent) {
        this.applySortAndFilter();
    }

    protected readonly LoadingStatus = LoadingStatus;
    protected readonly document = document;
}
