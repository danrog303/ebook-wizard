import {Component, Inject} from '@angular/core';
import {ActionPendingButtonComponent} from "../../../common/action-pending-button/action-pending-button.component";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AuthenticationService} from "../../../../services/authentication.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {
    RegistrationConfirmModalInput
} from "../../registration-page/registration-confirm-modal/registration-confirm-modal.component";
import {MaterialModule} from "../../../../modules/material.module";
import passwordStrengthValidator from "../../../../validators/password-strength.validator";
import passwordMatchValidator from "../../../../validators/password-match.validate";
import {NotificationService} from "../../../../services/notification.service";

export interface ResetPasswordConfirmModalInput {
    userEmail: string
}

@Component({
    selector: 'app-reset-password-confirm-modal',
    standalone: true,
    imports: [ActionPendingButtonComponent, ReactiveFormsModule, MaterialModule],
    templateUrl: './reset-password-confirm-modal.component.html',
    styleUrl: './reset-password-confirm-modal.component.scss'
})
export class ResetPasswordConfirmModalComponent {
    resetPasswordConfirmed: boolean = false;
    resetPasswordConfirmPending: boolean = false;
    resetPasswordConfirmForm: FormGroup;

    constructor(public dialogRef: MatDialogRef<ResetPasswordConfirmModalComponent>,
                @Inject(MAT_DIALOG_DATA) public userData: RegistrationConfirmModalInput,
                private notificationService: NotificationService,
                private authService: AuthenticationService,
                private routerService: Router) {
        this.resetPasswordConfirmForm = new FormGroup({
            'code': new FormControl(null, [
                Validators.required,
                Validators.pattern(/^\d{6}$/)]
            ),

            'newPassword': new FormControl(null, [
                Validators.required,
                Validators.minLength(8),
                passwordStrengthValidator
            ]),

            'newPasswordRepeat': new FormControl(null, [
                Validators.required,
                passwordMatchValidator("newPassword", "newPasswordRepeat")
            ])
        });
    }

    async navigateToLogin() {
        await this.routerService.navigateByUrl("/auth/login");
    }

    async onResetPasswordConfirmSubmitted() {
        this.resetPasswordConfirmPending = true;
        const email = this.userData.userEmail;
        const code = this.resetPasswordConfirmForm.value.code;
        const newPassword = this.resetPasswordConfirmForm.value.newPassword;

        try {
            await this.authService.confirmResetPassword(email, code, newPassword);
            this.resetPasswordConfirmed = true;
        } catch(e: any) {
            if (e.toString().includes("CodeMismatchException")) {
                this.notificationService.show("The confirmation code you entered is incorrect. Please try again.");
            } else {
                console.error(e);
                this.notificationService.show("An error occurred while confirming your password reset.");
            }
            this.resetPasswordConfirmPending = false;
            return;
        }

        this.resetPasswordConfirmPending = false;
    }
}
