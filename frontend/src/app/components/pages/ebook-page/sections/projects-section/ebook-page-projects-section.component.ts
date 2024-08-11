import {Component, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
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
import {
    CreateEbookProjectModalComponent
} from "@app/components/pages/ebook-page/modals/projects/create-modal/create-ebook-project-modal.component";
import {
    EbookProjectDetailsComponent
} from "@app/components/common/ebook-project-details/ebook-project-details.component";
import {
    EbookProjectMetaEditModal
} from "@app/components/pages/ebook-page/modals/projects/meta-edit-modal/meta-edit-modal.component";
import {
    EbookProjectDownloadModalComponent
} from "@app/components/pages/ebook-page/modals/projects/download-modal/ebook-project-download-modal.component";
import {Subscription} from "rxjs";
import {
    EbookProjectChangeCoverModalComponent
} from "@app/components/pages/ebook-page/modals/projects/change-cover-modal/ebook-project-change-cover-modal.component";
import {
    ConvertEbookProjectToFileModalComponent
} from "@app/components/pages/ebook-page/modals/projects/convert-to-file-modal/convert-to-file-modal.component";

@Component({
    selector: 'app-ebook-page-projects-section',
    standalone: true,
    imports: [MaterialModule, EbookFileDetailsComponent, CommonModule, EbookProjectDetailsComponent],
    templateUrl: './ebook-page-projects-section.component.html',
    styleUrl: './ebook-page-projects-section.component.scss'
})
export class EbookPageProjectsSectionComponent implements OnInit {
    ebookProjects: EbookProject[] = [];
    ebookProjectsLoading: LoadingStatus = LoadingStatus.NOT_STARTED;

    @ViewChildren('ebookProjectDropdownTrigger') ebookProjectDropdownMenus: QueryList<MatMenuTrigger> | null = null;
    selectedEbookProject: EbookProject | null = null;

    constructor(private ebookProjectService: EbookProjectService,
                private notificationService: NotificationService,
                private dialogService: MatDialog,
                private router: Router,
                private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
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
            },
            error: () => {
                this.ebookProjectsLoading = LoadingStatus.ERROR;
                this.notificationService.show('Failed to load ebook projects. Refresh the page and try again.');
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
        this.selectedEbookProject = this.ebookProjects[index];
    }

    onProjectDeleted(ebookProject: EbookProject) {
        this.ebookProjects = this.ebookProjects.filter((project) => project.id !== ebookProject.id);
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

    protected readonly LoadingStatus = LoadingStatus;
    protected readonly document = document;
}
