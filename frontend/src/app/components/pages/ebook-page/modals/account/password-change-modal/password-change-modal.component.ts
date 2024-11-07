import {Component, Inject} from '@angular/core';
import {MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import MaterialModule from "@app/modules/material.module";
import {CommonModule} from "@angular/common";
import AuthenticationService from "@app/services/authentication.service";
import NotificationService from "@app/services/notification.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import passwordStrengthValidator from "@app/validators/password-strength.validator";
import passwordMatchValidator from "@app/validators/password-match.validate";

@Component({
    selector: 'app-password-change-modal',
    standalone: true,
    imports: [
        MaterialModule,
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './password-change-modal.component.html',
    styleUrl: './password-change-modal.component.scss'
})
export class PasswordChangeModalComponent {
    passwordChangeForm = new FormGroup({
        oldPassword: new FormControl('', [
            Validators.required,
            Validators.minLength(8),

        ]),
        newPassword: new FormControl('', [
            Validators.required,
            Validators.minLength(8),
            passwordStrengthValidator
        ]),
        newPasswordRepeat: new FormControl('', [
            Validators.required,
            passwordMatchValidator("newPassword", "newPasswordRepeat")
        ])
    });

    hidePassword = true;
    hideNewPassword = true;
    hideNewPasswordRepeat = true;

    constructor(@Inject(MatDialogRef) private dialogRef: MatDialogRef<PasswordChangeModalComponent>,
                private authService: AuthenticationService,
                private notificationService: NotificationService) {
    }

    async onPasswordChangeFormSubmitted() {
        const oldPassword = this.passwordChangeForm.value.oldPassword!;
        const newPassword = this.passwordChangeForm.value.newPassword!;

        if (oldPassword === newPassword) {
            this.notificationService.show($localize`New password must be different from the old password.`);
            return;
        }

        try {
            await this.authService.updatePassword(oldPassword, newPassword);
            this.dialogRef.close();
            this.notificationService.show($localize`Password updated successfully.`);
        } catch(e: any) {
            if (e.toString().includes("Incorrect username or password")) {
                this.notificationService.show($localize`Incorrect password.`);
            } else {
                this.notificationService.show($localize`Failed to update the password. Refresh the page and try again.`);
            }
        }
    }
}
