import {Component} from '@angular/core';
import {RecaptchaModule} from "ng-recaptcha";
import {RouterModule} from "@angular/router";
import {MaterialModule} from "../../../../modules/material.module";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import env from "../../../../../environments/environment";
import passwordStrengthValidator from "../../../../validators/password-strength.validator";
import passwordMatchValidator from "../../../../validators/password-match.validate";
import {AuthenticationService} from "../../../../services/authentication.service";
import {MatDialog} from "@angular/material/dialog";
import {RegistrationConfirmModalComponent} from "../registration-confirm-modal/registration-confirm-modal.component";
import {ActionPendingButtonComponent} from "../../../common/action-pending-button/action-pending-button.component";
import {NotificationService} from "../../../../services/notification.service";

@Component({
    selector: 'app-registration-page-content',
    standalone: true,
    templateUrl: './registration-page-content.component.html',
    styleUrl: './registration-page-content.component.scss',
    imports: [MaterialModule, RouterModule, RecaptchaModule, ReactiveFormsModule, ActionPendingButtonComponent]
})
export class RegistrationPageContentComponent {
    pending = false;
    recaptchaSiteKey = env.RECAPTCHA_SITE_KEY;
    registerForm: FormGroup

    constructor(private cognitoService: AuthenticationService,
                private dialogService: MatDialog,
                private notificationService: NotificationService) {
        this.registerForm = new FormGroup({
            'email': new FormControl(null, [
                Validators.required, Validators.email
            ]),

            'nickname': new FormControl(null, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(20)
            ]),

            'password': new FormControl(null, [
                Validators.required,
                Validators.minLength(8),
                passwordStrengthValidator
            ]),

            'passwordRepeat': new FormControl(null, [
                Validators.required,
                passwordMatchValidator("password", "passwordRepeat")
            ]),

            'recaptcha': new FormControl(null, [
                Validators.required
            ])
        });
    }

    onRecaptchaResolved(recaptchaResponse: string | null) {
        this.registerForm.patchValue({"recaptcha": recaptchaResponse});
    }

    openConfirmRegistrationDialog(): void {
        const dialogRef = this.dialogService.open(RegistrationConfirmModalComponent, {
            data: {
                userEmail: this.registerForm.controls['email'].value
            },
            disableClose: true
        });
    }

    async onRegisterSubmit() {
        this.pending = true;
        try {
            await this.cognitoService.signUp(
                this.registerForm.controls['email'].value,
                this.registerForm.controls['nickname'].value,
                this.registerForm.controls['password'].value
            );
            this.openConfirmRegistrationDialog();
            this.pending = false;
        } catch (e: any) {
            if (e.toString().includes("UsernameExistsException")) {
                this.notificationService.show("User with this email already exists.");
            } else {
                console.error(e);
                this.notificationService.show("Error occurred during registration. Please try again later.");
            }
            this.pending = false;
        }
    }
}
