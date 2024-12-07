import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import MaterialModule from "@app/modules/material.module";
import AuthenticationService from "@app/services/authentication.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import {RouterLink, Router} from "@angular/router";
import NotificationService from "@app/services/notification.service";

export interface RegistrationConfirmModalInput {
    userEmail: string
}

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './registration-confirm-modal.component.html',
    styleUrl: './registration-confirm-modal.component.scss',
    standalone: true,
    imports: [MaterialModule, ReactiveFormsModule, ActionPendingButtonComponent, RouterLink]
})
export default class RegistrationConfirmModalComponent {
    registrationConfirmForm: FormGroup;
    registrationPending: boolean = false;
    codeResendPending: boolean = false;
    accountActivated = false;

    constructor(public dialogRef: MatDialogRef<RegistrationConfirmModalComponent>,
                @Inject(MAT_DIALOG_DATA) public userData: RegistrationConfirmModalInput,
                private readonly authService: AuthenticationService,
                private readonly notificationService: NotificationService,
                private readonly routerService: Router) {
        this.registrationConfirmForm = new FormGroup({
            'code': new FormControl(null, [Validators.required, Validators.pattern(/^\d{6}$/)])
        });
    }

    async onRegistrationConfirmSubmit() {
        this.registrationPending = true;
        try {
            await this.authService.confirmSignUp(this.userData.userEmail, this.registrationConfirmForm.value.code);
            this.registrationPending = false;
            this.accountActivated = true;
        } catch(e: any) {
            if (e.toString().includes("CodeMismatchException")) {
                this.notificationService.show($localize`Invalid confirmation code.`);
            } else {
                console.error(e);
                this.notificationService.show($localize`An error occurred while confirming registration.`);
            }
            this.registrationPending = false;
        }
    }

    async onCodeResend() {
        this.codeResendPending = true;
        try {
            await this.authService.resendSignUpConfirmationCode(this.userData.userEmail);
            this.notificationService.show($localize`Confirmation code has been resent.`);
        } catch(e: any) {
            if (e.toString().includes("LimitExceededException")) {
                this.notificationService.show($localize`You're going too fast! Please wait a little bit before next attempt.`);
            } else {
                console.error(e);
                this.notificationService.show($localize`An error occurred while resending confirmation code.`);
            }
        }
        this.codeResendPending = false;
    }

    navigateToLogin() {
        this.dialogRef.close();
        this.routerService.navigateByUrl("/auth/login").then();
    }
}
