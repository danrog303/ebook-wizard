import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import MaterialModule from "@app/modules/material.module";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import EbookFileService from "@app/services/ebook-file.service";
import NotificationService from "@app/services/notification.service";
import AuthenticationService from "@app/services/authentication.service";

@Component({
    selector: 'app-nickname-change-modal',
    standalone: true,
    imports: [
        MaterialModule,
        ReactiveFormsModule
    ],
    templateUrl: './nickname-change-modal.component.html',
    styleUrl: './nickname-change-modal.component.scss'
})
export class NicknameChangeModalComponent {
    nicknameForm = new FormGroup({
        nickname: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(20)
        ])
    });

    constructor(@Inject(MatDialogRef) private dialogRef: MatDialogRef<NicknameChangeModalComponent>,
                private authService: AuthenticationService,
                private notificationService: NotificationService) {
    }

    async onNicknameFormSubmitted() {
        try {
            this.dialogRef.disableClose = true;
            await this.authService.updateNickname(this.nicknameForm.value.nickname!);
            this.dialogRef.close();
            this.notificationService.show($localize`Nickname updated successfully.`);
            location.reload();
        } catch {
            this.dialogRef.disableClose = false;
            this.notificationService.show($localize`Failed to update the nickname. Refresh the page and try again.`);
        }
    }
}
