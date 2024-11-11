import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {DatePipe, NgOptimizedImage} from "@angular/common";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import MaterialModule from "@app/modules/material.module";
import EbookFileService from "@app/services/ebook-file.service";
import {MatDialog} from "@angular/material/dialog";
import {
    EbookFileMetaEditModalComponent
} from "@app/components/pages/ebook-page/modals/files/meta-edit-modal/ebook-file-meta-edit-modal.component";
import StringUtilsService from "@app/services/string-utils.service";
import {
    EbookFileFolderModalComponent
} from "@app/components/pages/ebook-page/modals/files/folder-modal/folder-modal.component";

@Component({
    selector: 'app-ebook-file-details',
    standalone: true,
    imports: [DatePipe, MaterialModule, NgOptimizedImage],
    templateUrl: './ebook-file-details.component.html',
    styleUrl: './ebook-file-details.component.scss'
})
export class EbookFileDetailsComponent implements OnChanges {
    coverUrl: string | null = null;
    coverUrlLoadingStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    @Input() ebookFile: EbookFile | null = null;
    @Output() ebookFileChange = new EventEmitter<EbookFile>();

    constructor(private ebookFileService: EbookFileService,
                private matDialog: MatDialog,
                public stringUtils: StringUtilsService) {
    }

    ngOnChanges() {
        if (!this.ebookFile) {
            return;
        }

        this.coverUrlLoadingStatus = LoadingStatus.LOADING;
        this.ebookFileService.getUrlToDisplayCoverImage(this.ebookFile.id!).subscribe({
            next: (url: string) => {
                this.coverUrl = url;
                this.coverUrlLoadingStatus = LoadingStatus.LOADED;
            },
            error: () => {
                this.coverUrlLoadingStatus = LoadingStatus.ERROR;
            }
        });
    }

    openEditModal() {
        const modalRef = this.matDialog.open(EbookFileMetaEditModalComponent, {
            data: this.ebookFile,
        });

        modalRef.afterClosed().subscribe((result: EbookFile | null) => {
            if (result) {
                this.ebookFile = result;
                this.ebookFileChange.emit(result);
            }
        });
    }

    openEditFolderNameModal() {
        const modalRef = this.matDialog.open(EbookFileFolderModalComponent, {
            data: this.ebookFile,
            autoFocus: false
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
