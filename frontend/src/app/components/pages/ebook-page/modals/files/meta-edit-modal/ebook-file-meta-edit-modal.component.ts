import {Component, Inject} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import structuredClone from "@ungap/structured-clone";
import EbookFileMetaEditFormComponent from "@app/components/common/ebook-file-meta-edit-form/ebook-file-meta-edit-form.component";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import EbookFile from "@app/models/ebook-file/ebook-file.model";

@Component({
    selector: 'app-meta-edit-modal',
    standalone: true,
    imports: [
        ActionPendingButtonComponent,
        MatButton,
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatDialogTitle,
        EbookFileMetaEditFormComponent
    ],
    templateUrl: './ebook-file-meta-edit-modal.component.html',
    styleUrl: './ebook-file-meta-edit-modal.component.scss'
})
export class EbookFileMetaEditModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public ebookFile: EbookFile,
                @Inject(MatDialogRef) private readonly dialogRef: MatDialogRef<EbookFileMetaEditModalComponent>) {
        this.ebookFile = structuredClone(ebookFile);
    }

    onEbookFileUpdated($event: EbookFile) {
        this.ebookFile = $event;
        this.dialogRef.close($event);
    }
}
