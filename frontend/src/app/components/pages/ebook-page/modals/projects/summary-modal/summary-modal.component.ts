import {Component, Inject} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {EbookFileDetailsComponent} from "@app/components/common/ebook-file-details/ebook-file-details.component";
import {EbookProjectDetailsComponent} from "@app/components/common/ebook-project-details/ebook-project-details.component";
import EbookProject from "@app/models/ebook-project/ebook-project.model";

@Component({
    selector: 'app-ebook-project-summary-modal',
    standalone: true,
    imports: [MaterialModule, EbookFileDetailsComponent, EbookProjectDetailsComponent],
    templateUrl: './summary-modal.component.html',
    styleUrl: './summary-modal.component.scss'
})
export class EbookProjectSummaryModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public ebookProject: EbookProject,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookProjectSummaryModalComponent>) {
    }
}
