import {Component} from '@angular/core';
import {MaterialModule} from "../../../../modules/material.module";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthenticationService} from "../../../../services/authentication.service";
import {RouterModule} from "@angular/router";
import {ActionPendingButtonComponent} from "../../../common/action-pending-button/action-pending-button.component";
import {MatDialog} from "@angular/material/dialog";
import {ResetPasswordConfirmModalComponent} from "../reset-password-confirm-modal/reset-password-confirm-modal.component";
import {NotificationService} from "../../../../services/notification.service";

@Component({
    selector: 'app-reset-password-page-content',
    standalone: true,
    imports: [MaterialModule, ActionPendingButtonComponent, ReactiveFormsModule, RouterModule],
    templateUrl: './reset-password-page-content.component.html',
    styleUrl: './reset-password-page-content.component.scss'
})
export class ResetPasswordPageContentComponent {
    resetPasswordForm: FormGroup;
    resetPasswordPending: boolean = false;

    constructor(private authService: AuthenticationService,
                private notificationService: NotificationService,
                private dialogService: MatDialog) {
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
                this.notificationService.show("You have exceeded the limit for password reset attempts. Please try again later.");
            } else {
                console.error(e);
                this.notificationService.show("An error occurred while resetting your password.");
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
