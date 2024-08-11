import {AfterContentInit, Component, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import {MatMenuTrigger} from "@angular/material/menu";
import {MatDialog} from "@angular/material/dialog";

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
import {
    EbookFileChangeCoverModalComponent
} from "@app/components/pages/ebook-page/modals/files/change-cover-modal/ebook-file-change-cover-modal.component";
import {
    ConvertEbookFileToProjectModalComponent
} from "@app/components/pages/ebook-page/modals/files/convert-to-project-modal/convert-to-project-modal.component";

@Component({
    selector: 'app-ebook-page-files-section',
    standalone: true,
    imports: [MaterialModule, NgOptimizedImage, CommonModule, EbookFileDetailsComponent],
    templateUrl: './ebook-page-files-section.component.html',
    styleUrl: './ebook-page-files-section.component.scss'
})
export class EbookPageFilesSectionComponent implements AfterContentInit {
    selectedEbookFile: EbookFile | null = null;

    ebookFiles: EbookFile[] = [];
    ebookFilesLoading: LoadingStatus = LoadingStatus.NOT_STARTED;

    @ViewChildren('ebookFileDropdownTrigger') ebookFileDropdownMenus: QueryList<MatMenuTrigger> | null = null;

    constructor(private ebookFileService: EbookFileService,
                private notificationService: NotificationService,
                private dialogService: MatDialog,
                private router: Router,
                private activatedRoute: ActivatedRoute) {
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
            },
            error: () => {
                this.ebookFilesLoading = LoadingStatus.ERROR;
                this.notificationService.show('Failed to load ebook files. Refresh the page and try again.');
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
             if (dialogRef.componentInstance.ebookFileUploadStatus === LoadingStatus.LOADED) {
                 this.ebookFiles.push(dialogRef.componentInstance.ebookFile!);
             }
        });
    }

    markEbookFileAsSelected(index: number) {
        this.selectedEbookFile = this.ebookFiles[index];
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
            }
        });
    }

    openShareModal(ebookFile: EbookFile) {
        const modalRef = this.dialogService.open(EbookFileShareModalComponent, {
            autoFocus: false,
            disableClose: true,
            data: ebookFile
        });
    }

    openReaderPage(ebookFile: EbookFile) {
        this.router.navigate(['/reader/ebook-file', ebookFile.id]).then();
    }

    onEbookFileDeleted(ebookFile: EbookFile) {
        this.ebookFiles = this.ebookFiles.filter((file) => file.id !== ebookFile.id);
    }

    openChangeCoverImageModal(ebookFile: EbookFile) {
        const modalRef = this.dialogService.open(EbookFileChangeCoverModalComponent, {
            autoFocus: false,
            data: ebookFile,
            disableClose: true
        });

        modalRef.afterClosed().subscribe(() => {
            this.refreshEbookFiles();
        });
    }

    openConvertToProjectModal(ebookFile: EbookFile) {
        const modalRef = this.dialogService.open(ConvertEbookFileToProjectModalComponent, {
            autoFocus: false,
            data: ebookFile,
            disableClose: true
        });

        modalRef.afterClosed().subscribe(() => {
            this.refreshEbookFiles();
        });
    }

    protected readonly document = document;
    protected readonly LoadingStatus = LoadingStatus;
}
