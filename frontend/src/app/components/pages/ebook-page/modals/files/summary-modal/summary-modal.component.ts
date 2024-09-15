import {Component, Inject} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import {EbookFileDetailsComponent} from "@app/components/common/ebook-file-details/ebook-file-details.component";

@Component({
    selector: 'app-ebook-file-summary-modal',
    standalone: true,
    imports: [MaterialModule, EbookFileDetailsComponent],
    templateUrl: './summary-modal.component.html',
    styleUrl: './summary-modal.component.scss'
})
export class EbookFileSummaryModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public ebookFile: EbookFile,
                @Inject(MatDialogRef) private dialogRef: MatDialogRef<EbookFileSummaryModalComponent>) {
    }
}
