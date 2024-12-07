import {Component, Inject, OnInit} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatSelectChange} from "@angular/material/select";
import EbookFolder from "@app/models/ebook/ebook-folder.model";
import EbookFileService from "@app/services/ebook-file.service";
import NotificationService from "@app/services/notification.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import {NgClass} from "@angular/common";
import {Router} from "@angular/router";

@Component({
    selector: 'app-ebook-file-folder-modal',
    standalone: true,
    imports: [MaterialModule, ReactiveFormsModule, ActionPendingButtonComponent, NgClass],
    templateUrl: './folder-modal.component.html',
    styleUrl: './folder-modal.component.scss'
})
export class EbookFileFolderModalComponent implements OnInit {
    isPending: boolean = false;
    existingFoldersToChoose: EbookFolder[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) public ebookFile: EbookFile,
                @Inject(MatDialogRef) private readonly dialogRef: MatDialogRef<EbookFileFolderModalComponent>,
                private readonly ebookFileService: EbookFileService,
                private readonly notificationService: NotificationService,
                private readonly router: Router) {}


    folderForm: FormGroup = new FormGroup({
        folderName: new FormControl('', [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(128)
        ])
    })

    ngOnInit() {
        this.ebookFileService.getExistingFolders().subscribe({
            next: (folders) => {
                this.existingFoldersToChoose = folders;
            },
            error: () => {
                this.notificationService.show($localize`Failed to load existing folders.`);
            }
        });

        this.folderForm.patchValue({
            folderName: this.ebookFile.containerName
        });
    }

    onSubmitFolderAssign() {
        this.isPending = true;
        this.dialogRef.disableClose = true;
        this.ebookFile.containerName = this.folderForm.value.folderName;
        this.ebookFileService.updateEbookFile(this.ebookFile.id!, this.ebookFile).subscribe({
            next: () => {
                if (this.folderForm.value.folderName) {
                    this.notificationService.show($localize`Folder assigned successfully.`);
                } else {
                    this.notificationService.show($localize`Folder removed successfully.`);
                }
                this.dialogRef.close(true);
                this.isPending = false;
                this.dialogRef.disableClose = false;

                this.router.navigate(['/ebook-file'], {queryParams: {folder: this.ebookFile.containerName || ""}}).then();
            },
            error: () => {
                this.notificationService.show($localize`Failed to assign folder.`);
                this.isPending = false;
                this.dialogRef.disableClose = false;
            }
        });
    }

    onExistingFolderChosen(event: MatSelectChange) {
        this.folderForm.patchValue({
            folderName: event.value
        });
    }

    onRemoveFolderAssignment() {
        if (this.isPending) {
            return;
        }

        this.folderForm.patchValue({
            folderName: ''
        });

        this.onSubmitFolderAssign();
    }
}
