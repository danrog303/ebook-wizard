import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";

import MaterialModule from "@app/modules/material.module";
import EbookFileService from "@app/services/ebook-file.service";
import NotificationService from "@app/services/notification.service";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import EbookFile, {createEmptyEbookFile} from "@app/models/ebook-file/ebook-file.model";
import LoadingStatus from "@app/models/misc/loading-status.enum";

@Component({
    selector: 'app-ebook-file-meta-edit-form',
    standalone: true,
    imports: [MaterialModule, CommonModule, ReactiveFormsModule, ActionPendingButtonComponent],
    templateUrl: './ebook-file-meta-edit-form.component.html',
    styleUrl: './ebook-file-meta-edit-form.component.scss'
})
export default class EbookFileMetaEditFormComponent implements OnChanges {
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    protected readonly LoadingStatus = LoadingStatus;

    metadataForm = new FormGroup({
        name: new FormControl("", [Validators.required, Validators.minLength(2), Validators.maxLength(128)]),
        author: new FormControl("", [Validators.required, Validators.minLength(2), Validators.maxLength(128)]),
        description: new FormControl("", [Validators.maxLength(2048)]),
        tags: new FormControl([] as string[], [Validators.maxLength(64)])
    });

    ebookFileUpdateMetaStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    @Input() ebookFile: EbookFile = createEmptyEbookFile();
    @Output() updateEbookFile = new EventEmitter<EbookFile>();

    constructor(private ebookFileService: EbookFileService,
                private notificationService: NotificationService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["ebookFile"]) {
            try {
                this.metadataForm.patchValue({
                    name: this.ebookFile.name,
                    author: this.ebookFile.author,
                    description: this.ebookFile.description,
                });
            } catch(e) {
                this.ebookFile = createEmptyEbookFile();
            }
        }
    }

    addEbookFileTag(event: MatChipInputEvent) {
        const value = (event.value || '').trim();

        if (value && !this.ebookFile?.tags.includes(value)) {
            this.ebookFile?.tags.push(value);
        }

        event.chipInput!.clear();
    }

    deleteEbookFileTag(tag: string) {
        const index = this.ebookFile?.tags.indexOf(tag);

        if (index !== undefined && index !== -1) {
            this.ebookFile?.tags.splice(index, 1);
        }
    }

    updateEbookFileMeta() {
        this.ebookFileUpdateMetaStatus = LoadingStatus.LOADING;

        // Update name, author and description fields
        // Field "tags" is already updated inside "addEbookFileTag" handler
        this.ebookFile!.name = this.metadataForm.get('name')?.value || "Unknown name";
        this.ebookFile!.author = this.metadataForm.get('author')?.value || "Unknown author";
        this.ebookFile!.description = this.metadataForm.get('description')?.value || "";

        this.ebookFileService.updateEbookFile(this.ebookFile!.id!, this.ebookFile!).subscribe({
            next: (ebookFile: EbookFile) => {
                this.ebookFileUpdateMetaStatus = LoadingStatus.LOADED;
                this.ebookFile = ebookFile;
                this.updateEbookFile.emit(ebookFile);
            },
            error: () => {
                this.ebookFileUpdateMetaStatus = LoadingStatus.ERROR;
                this.notificationService.show($localize`Failed to update metadata of the ebook file. Refresh the page and try again.`);
            }
        });
    }
}
