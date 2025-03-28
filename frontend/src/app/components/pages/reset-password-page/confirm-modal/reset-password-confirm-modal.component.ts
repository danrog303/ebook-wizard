import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import AuthenticationService from "@app/services/authentication.service";
import {Router} from "@angular/router";
import MaterialModule from "@app/modules/material.module";
import passwordStrengthValidator from "@app/validators/password-strength.validator";
import passwordMatchValidator from "@app/validators/password-match.validate";
import NotificationService from "@app/services/notification.service";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";

export interface ResetPasswordConfirmModalInput {
    userEmail: string
}

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    imports: [ActionPendingButtonComponent, ReactiveFormsModule, MaterialModule],
    templateUrl: './reset-password-confirm-modal.component.html',
    styleUrl: './reset-password-confirm-modal.component.scss'
})
export default class ResetPasswordConfirmModalComponent {
    resetPasswordConfirmed: boolean = false;
    resetPasswordConfirmPending: boolean = false;
    resetPasswordConfirmForm: FormGroup;

    hidePassword = true;
    hidePasswordRepeat = true;

    constructor(public dialogRef: MatDialogRef<ResetPasswordConfirmModalComponent>,
                @Inject(MAT_DIALOG_DATA) public userData: ResetPasswordConfirmModalInput,
                private readonly notificationService: NotificationService,
                private readonly authService: AuthenticationService,
                private readonly routerService: Router) {
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
                this.notificationService.show($localize`The confirmation code you entered is incorrect. Please try again.`);
            } else {
                console.error(e);
                this.notificationService.show($localize`An error occurred while confirming your password reset.`);
            }
            this.resetPasswordConfirmPending = false;
            return;
        }

        this.resetPasswordConfirmPending = false;
    }
}
