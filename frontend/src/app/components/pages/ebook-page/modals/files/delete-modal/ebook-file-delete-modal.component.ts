import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

import EbookFileService from "@app/services/ebook-file.service";
import NotificationService from "@app/services/notification.service";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import MaterialModule from "@app/modules/material.module";
import LoadingStatus from "@app/models/misc/loading-status.enum";

@Component({
  selector: 'app-delete-modal',
  standalone: true,
    imports: [MaterialModule, ActionPendingButtonComponent],
  templateUrl: './ebook-file-delete-modal.component.html',
  styleUrl: './ebook-file-delete-modal.component.scss'
})
export class EbookFileDeleteModalComponent {
    deleteStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    constructor(@Inject(MAT_DIALOG_DATA) public ebookFile: EbookFile,
                @Inject(MatDialogRef) private readonly dialogRef: MatDialogRef<EbookFileDeleteModalComponent>,
                private readonly ebookFileService: EbookFileService,
                private readonly notificationService: NotificationService) {
    }


    onDeleteEbook() {
        this.deleteStatus = LoadingStatus.LOADING;

        this.ebookFileService.deleteEbookFile(this.ebookFile.id!).subscribe({
            next: () => {
                this.deleteStatus = LoadingStatus.LOADED;
                this.dialogRef.close(true);
            },
            error: () => {
                this.deleteStatus = LoadingStatus.ERROR;
                this.notificationService.show($localize`Failed to delete ebook file. Refresh the page and try again`)
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
