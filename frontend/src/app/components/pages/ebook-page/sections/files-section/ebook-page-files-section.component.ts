import {AfterContentInit, AfterViewInit, Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {MatMenuTrigger} from "@angular/material/menu";
import {MatDialog} from "@angular/material/dialog";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

import EbookFileService from "@app/services/ebook-file.service";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import NotificationService from "@app/services/notification.service";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import MaterialModule from "@app/modules/material.module";
import {EbookFileDetailsComponent} from "@app/components/common/ebook-file-details/ebook-file-details.component";
import {EbookFileImportModalComponent} from "@app/components/pages/ebook-page/modals/files/import-modal/ebook-file-import-modal.component";
import {EbookFileDeleteModalComponent} from "@app/components/pages/ebook-page/modals/files/delete-modal/ebook-file-delete-modal.component";
import {EbookFileDownloadModalComponent} from "@app/components/pages/ebook-page/modals/files/download-modal/ebook-file-download-modal.component";
import {EbookFileSendModalComponent} from "@app/components/pages/ebook-page/modals/files/send-modal/ebook-file-send-modal.component";
import {EbookFileMetaEditModalComponent} from "@app/components/pages/ebook-page/modals/files/meta-edit-modal/ebook-file-meta-edit-modal.component";
import {EbookFileShareModalComponent} from "@app/components/pages/ebook-page/modals/files/share-modal/share-modal.component";
import {EbookFileChangeCoverModalComponent} from "@app/components/pages/ebook-page/modals/files/change-cover-modal/ebook-file-change-cover-modal.component";
import {ConvertEbookFileToProjectModalComponent} from "@app/components/pages/ebook-page/modals/files/convert-to-project-modal/convert-to-project-modal.component";
import {EbookFileSummaryModalComponent} from "@app/components/pages/ebook-page/modals/files/summary-modal/summary-modal.component";

@Component({
    selector: 'app-ebook-page-files-section',
    standalone: true,
    imports: [MaterialModule, NgOptimizedImage, CommonModule, EbookFileDetailsComponent, ReactiveFormsModule, FormsModule],
    templateUrl: './ebook-page-files-section.component.html',
    styleUrl: './ebook-page-files-section.component.scss'
})
export class EbookPageFilesSectionComponent implements AfterContentInit, AfterViewInit {
    selectedEbookFile: EbookFile | null = null;

    ebookFiles: EbookFile[] = [];
    ebookFilesLoading: LoadingStatus = LoadingStatus.NOT_STARTED;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | null = null;
    @ViewChildren('ebookFileDropdownTrigger') ebookFileDropdownMenus: QueryList<MatMenuTrigger> | null = null;

    ebookFilesSorted: EbookFile[] = [];
    filterKeyword: string = "";
    sortBy: string = "";

    constructor(private ebookFileService: EbookFileService,
                private notificationService: NotificationService,
                private dialogService: MatDialog,
                private router: Router,
                private activatedRoute: ActivatedRoute) {
    }

    ngAfterViewInit() {
        this.sortBy = sessionStorage.getItem('ebookFilesSortBy') ?? 'sort_creation_date';
        this.filterKeyword = sessionStorage.getItem('ebookFilesFilterKeyword') ?? '';

        if (this.paginator) {
            this.paginator._intl.itemsPerPageLabel = $localize`Files per page`;
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
    }

    ngAfterContentInit() {
        this.refreshEbookFiles();
        this.activatedRoute.queryParamMap.subscribe((params) => {
            const activeModal = params.get('modal');
            if (activeModal === 'creator') {
                this.openEbookFileImportModal();
            }
        });
    }

    refreshEbookFiles() {
        this.ebookFilesLoading = LoadingStatus.LOADING;
        this.ebookFileService.listEbookFilesOfAuthenticatedUser().subscribe({
            next: (ebookFiles: EbookFile[]) => {
                let activeEbookIndex = -1;
                if (this.selectedEbookFile) {
                    activeEbookIndex = this.ebookFiles.indexOf(this.selectedEbookFile);
                }

                this.ebookFiles = ebookFiles;
                this.ebookFilesLoading = LoadingStatus.LOADED;

                if (this.selectedEbookFile) {
                    this.selectedEbookFile = this.ebookFiles[activeEbookIndex];
                }

                this.applySortAndFilter();
            },
            error: () => {
                this.ebookFilesLoading = LoadingStatus.ERROR;
                this.notificationService.show($localize`Failed to load ebook files. Refresh the page and try again.`);
            }
        });
    }

    openEbookFileDropdownMenu(event: Event, index: number) {
        event.preventDefault();
        this.ebookFileDropdownMenus?.get(index)?.openMenu();
    }

    openEbookFileImportModal() {
        const dialogRef = this.dialogService.open(EbookFileImportModalComponent, {
            autoFocus: false,
        });

        dialogRef.afterClosed().subscribe(() => {
             dialogRef.componentInstance.uploadedEbookFiles.forEach(ebook => this.ebookFiles.push(ebook));
             this.applySortAndFilter();
        });
    }

    markEbookFileAsSelected(index: number) {
        this.selectedEbookFile = this.ebookFilesSorted[index];
    }

    openDeleteModal(ebookFile: EbookFile) {
        const modalRef = this.dialogService.open(EbookFileDeleteModalComponent, {
            autoFocus: false,
            data: ebookFile
        });

        modalRef.afterClosed().subscribe((result: boolean | undefined) => {
            if (result === true) {
                this.onEbookFileDeleted(ebookFile);
            }
        });
    }

    openDownloadModal(ebookFile: EbookFile) {
        const modalRef = this.dialogService.open(EbookFileDownloadModalComponent, {
            autoFocus: false,
            data: ebookFile
        });

        modalRef.afterClosed().subscribe(() => {
            if (modalRef.componentInstance.modalDirty) {
                this.refreshEbookFiles();
                this.applySortAndFilter();
            }
        });
    }

    openSendToReaderModal(ebookFile: EbookFile) {
        const modalRef = this.dialogService.open(EbookFileSendModalComponent, {
            autoFocus: false,
            data: ebookFile
        });

        modalRef.afterClosed().subscribe(() => {
           if (modalRef.componentInstance.conversionPerformed) {
                this.refreshEbookFiles();
           }
        });
    }

    openChangeMetadataModal(ebookFile: EbookFile) {
        const modalRef = this.dialogService.open(EbookFileMetaEditModalComponent, {
            autoFocus: false,
            data: ebookFile
        });

        modalRef.afterClosed().subscribe((result: EbookFile | undefined) => {
            if (result) {
                const index = this.ebookFiles.findIndex(file => file.id === result.id);
                if (index !== -1) {
                    this.ebookFiles[index] = result;
                }
                this.selectedEbookFile = result;
                this.applySortAndFilter();
            }
        });
    }

    openShareModal(ebookFile: EbookFile) {
        const modalRef = this.dialogService.open(EbookFileShareModalComponent, {
            autoFocus: false,
            data: ebookFile
        });
    }

    openReaderPage(ebookFile: EbookFile) {
        this.router.navigate(['/reader/ebook-file', ebookFile.id]).then();
    }

    onEbookFileDeleted(ebookFile: EbookFile) {
        this.ebookFiles = this.ebookFiles.filter((file) => file.id !== ebookFile.id);
        this.applySortAndFilter();
    }

    openChangeCoverImageModal(ebookFile: EbookFile) {
        const modalRef = this.dialogService.open(EbookFileChangeCoverModalComponent, {
            autoFocus: false,
            data: ebookFile,
        });

        modalRef.afterClosed().subscribe((result: boolean | undefined) => {
            if (result) {
                this.refreshEbookFiles();
            }
        });
    }

    openConvertToProjectModal(ebookFile: EbookFile) {
        const modalRef = this.dialogService.open(ConvertEbookFileToProjectModalComponent, {
            autoFocus: false,
            data: ebookFile
        });

        modalRef.afterClosed().subscribe((result: boolean | undefined) => {
            if (result) {
                this.refreshEbookFiles();
            }
        });
    }

    openEbookFileDetailsModal(ebookFile: EbookFile) {
        this.dialogService.open(EbookFileSummaryModalComponent, {
            autoFocus: false,
            data: ebookFile
        });
    }

    applySortAndFilter() {
        sessionStorage.setItem('ebookFilesSortBy', this.sortBy);
        sessionStorage.setItem('ebookFilesFilterKeyword', this.filterKeyword);

        this.ebookFilesSorted = this.ebookFiles.filter((file) => {
            if (this.filterKeyword === "") {
                return true;
            }

            return file.name.toLowerCase().includes(this.filterKeyword.toLowerCase()) ||
                file.description?.toLowerCase().includes(this.filterKeyword.toLowerCase()) ||
                file.author?.toLowerCase().includes(this.filterKeyword.toLowerCase()) ||
                file.tags.some((tag) => tag.toLowerCase().includes(this.filterKeyword.toLowerCase()));
        }).sort((a, b) => {
            if (this.sortBy === 'sort_title') {
                return a.name.localeCompare(b.name);
            }

            if (this.sortBy == 'sort_creation_date') {
                return new Date(a.creationDate!).getTime() - new Date(b.creationDate!).getTime();
            }

            if (this.sortBy === 'sort_author' && a.hasOwnProperty('author') && b.hasOwnProperty('author')) {
                return a.author!.localeCompare(b.author!);
            }

            return 0;
        });

        this.paginator!.length = this.ebookFilesSorted.length;
        this.ebookFilesSorted = this.ebookFilesSorted.slice(this.paginator!.pageIndex * this.paginator!.pageSize, (this.paginator!.pageIndex + 1) * this.paginator!.pageSize);

        // Reset to first page if the current page is out of bounds
        if (this.paginator!.pageIndex > this.paginator!.getNumberOfPages() - 1) {
            this.paginator!.pageIndex = 0;
        }
    }

    handlePageChange($event: PageEvent) {
        this.applySortAndFilter();
    }

    protected readonly document = document;
    protected readonly LoadingStatus = LoadingStatus;
}
