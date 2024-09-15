import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {DatePipe, NgOptimizedImage} from "@angular/common";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import MaterialModule from "@app/modules/material.module";
import EbookProjectService from "@app/services/ebook-project.service";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import {MatDialog} from "@angular/material/dialog";
import {
    EbookProjectMetaEditModal
} from "@app/components/pages/ebook-page/modals/projects/meta-edit-modal/meta-edit-modal.component";
import StringUtilsService from "@app/services/string-utils.service";

@Component({
    selector: 'app-ebook-project-details',
    standalone: true,
    imports: [DatePipe, MaterialModule, NgOptimizedImage],
    templateUrl: './ebook-project-details.component.html',
    styleUrl: './ebook-project-details.component.scss'
})
export class EbookProjectDetailsComponent implements OnChanges {
    coverUrl: string | null = null;
    coverUrlLoadingStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    @Input() ebookProject: EbookProject | null = null;
    @Output() ebookProjectChange = new EventEmitter<EbookProject>();

    constructor(private ebookProjectService: EbookProjectService,
                private matDialog: MatDialog,
                public stringUtils: StringUtilsService) {
    }

    ngOnChanges() {
        if (!this.ebookProject?.coverImageKey) {
            this.coverUrl = null;
            this.coverUrlLoadingStatus = LoadingStatus.NOT_STARTED;
            return;
        }

        if (this.ebookProject === null) {
            return;
        }

        this.coverUrlLoadingStatus = LoadingStatus.LOADING;
        this.ebookProjectService.getUrlToDisplayCoverImage(this.ebookProject.id!).subscribe({
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
        const modalRef = this.matDialog.open(EbookProjectMetaEditModal, {
            data: this.ebookProject,
        });

        modalRef.afterClosed().subscribe((result: EbookProject | null) => {
            if (result) {
                this.ebookProject = result;
                this.ebookProjectChange.emit(result);
            }
        });
     }

    protected readonly LoadingStatus = LoadingStatus;
}
