import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import EbookProject from "@app/models/ebook-project/ebook-project.model";
import EbookProjectService from "@app/services/ebook-project.service";
import NotificationService from "@app/services/notification.service";
import MaterialModule from "@app/modules/material.module";
import {
    EbookProjectMetaEditFormComponent
} from "@app/components/common/ebook-project-meta-edit-form/ebook-project-meta-edit-form.component";

@Component({
  selector: 'app-ebook-project-edit-metadata-modal',
  standalone: true,
    imports: [MaterialModule, EbookProjectMetaEditFormComponent],
  templateUrl: './meta-edit-modal.component.html',
  styleUrl: './meta-edit-modal.component.scss'
})
export class EbookProjectMetaEditModal {
    constructor(@Inject(MAT_DIALOG_DATA) public ebookProject: EbookProject,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookProjectMetaEditModal>,
                private notificationService: NotificationService) {
    }

    onEbookProjectUpdated(ebookProject: EbookProject) {
        this.dialogRef.close(ebookProject);
        this.notificationService.show($localize`Project metadata updated successfully.`);
    }
}
