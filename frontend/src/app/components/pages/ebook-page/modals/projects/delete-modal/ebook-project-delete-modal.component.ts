import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import NotificationService from "@app/services/notification.service";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import MaterialModule from "@app/modules/material.module";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import EbookProjectService from "@app/services/ebook-project.service";

@Component({
    selector: 'app-ebook-project-delete-modal',
    standalone: true,
    imports: [MaterialModule, ActionPendingButtonComponent],
    templateUrl: './ebook-project-delete-modal.component.html',
    styleUrl: './ebook-project-delete-modal.component.scss'
})
export class EbookProjectDeleteModalComponent {
    deleteStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    constructor(@Inject(MAT_DIALOG_DATA) public ebookProject: EbookProject,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookProjectDeleteModalComponent>,
                private ebookProjectService: EbookProjectService,
                private notificationService: NotificationService) {
    }


    onDeleteProject() {
        this.deleteStatus = LoadingStatus.LOADING;

        this.ebookProjectService.deleteEbookProject(this.ebookProject.id!).subscribe({
            next: () => {
                this.deleteStatus = LoadingStatus.LOADED;
                this.dialogRef.close(true);
                this.notificationService.show('Project deleted successfully.')
            },
            error: () => {
                this.deleteStatus = LoadingStatus.ERROR;
                this.notificationService.show('Failed to delete the project. Refresh the page and try again.')
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
