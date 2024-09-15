import {Component, Inject} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import {RouterLink} from "@angular/router";
import EbookFormat from "@app/models/ebook/ebook-format.enum";
import {ebookHasFormat} from "@app/components/pages/ebook-reader-page/content/ebook-reader-page.component";

export interface EbookReaderSmModalProps {
    ebookFile: EbookFile;
    isUserOwner: boolean,
    isUserAuthenticated: boolean,
    chosenFormat: EbookFormat | null,

    onFormatChanged(chosenFormat: EbookFormat | null): void;
}

@Component({
    selector: 'app-ebook-reader-sm-modal',
    standalone: true,
    imports: [MaterialModule, RouterLink],
    templateUrl: './ebook-reader-sm-modal.component.html',
    styleUrl: './ebook-reader-sm-modal.component.scss'
})
export class EbookReaderSmModalComponent  {
    constructor(@Inject(MAT_DIALOG_DATA) public props: EbookReaderSmModalProps) {
    }

    protected readonly EbookFormat = EbookFormat;
    protected readonly ebookHasFormat = ebookHasFormat;
}
