import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Component} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {RouterModule} from "@angular/router";
import MaterialModule from "@app/modules/material.module";
import AuthenticationService from "@app/services/authentication.service";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import ResetPasswordConfirmModalComponent from "@app/components/pages/reset-password-page/confirm-modal/reset-password-confirm-modal.component";
import NotificationService from "@app/services/notification.service";

@Component({
    selector: 'app-reset-password-page-ebook-page-content',
    standalone: true,
    imports: [MaterialModule, ActionPendingButtonComponent, ReactiveFormsModule, RouterModule],
    templateUrl: './reset-password-page-content.component.html',
    styleUrl: './reset-password-page-content.component.scss'
})
export class ResetPasswordPageContentComponent {
    resetPasswordForm: FormGroup;
    resetPasswordPending: boolean = false;

    constructor(private readonly authService: AuthenticationService,
                private readonly notificationService: NotificationService,
                private readonly dialogService: MatDialog) {
        this.resetPasswordForm = new FormGroup({
            'email': new FormControl(null, [Validators.required, Validators.email])
        });
    }

    async onResetPasswordSubmit() {
        this.resetPasswordPending = true;

        try {
            await this.authService.resetPassword(this.resetPasswordForm.value.email);
            this.resetPasswordPending = false;
            this.openConfirmResetDialog();
        } catch(e: any) {
            if (e.toString().includes("LimitExceededException")) {
                this.notificationService.show($localize`You have exceeded the limit for password reset attempts. Please try again later.`);
            } else {
                console.error(e);
                this.notificationService.show($localize`An error occurred while resetting your password.`);
            }
            this.resetPasswordPending = false;
        }
    }

    openConfirmResetDialog(): void {
        const dialogConfig = {
            data: {
                userEmail: this.resetPasswordForm.controls['email'].value
            },
            disableClose: true
        };

        this.dialogService.open(ResetPasswordConfirmModalComponent, dialogConfig);
    }
}
