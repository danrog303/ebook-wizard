import {Component} from '@angular/core';
import {RecaptchaModule} from "ng-recaptcha-2";
import {RouterModule} from "@angular/router";
import MaterialModule from "@app/modules/material.module";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import env from "@env/environment";
import passwordStrengthValidator from "@app/validators/password-strength.validator";
import passwordMatchValidator from "@app/validators/password-match.validate";
import AuthenticationService from "@app/services/authentication.service";
import {MatDialog} from "@angular/material/dialog";
import RegistrationConfirmModalComponent from "@app/components/pages/registration-page/confirm-modal/registration-confirm-modal.component";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import NotificationService from "@app/services/notification.service";

@Component({
    selector: 'app-registration-page-ebook-page-content',
    standalone: true,
    templateUrl: './registration-page-content.component.html',
    styleUrl: './registration-page-content.component.scss',
    imports: [MaterialModule, RouterModule, RecaptchaModule, ReactiveFormsModule, ActionPendingButtonComponent]
})
export class RegistrationPageContentComponent {
    pending = false;
    recaptchaSiteKey = env.RECAPTCHA_SITE_KEY;
    registerForm: FormGroup

    hidePassword = true;
    hidePasswordRepeat = true;

    constructor(private readonly cognitoService: AuthenticationService,
                private readonly dialogService: MatDialog,
                private readonly notificationService: NotificationService) {
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

            "termsAndConditionsAccepted": new FormControl(false, [
                Validators.requiredTrue
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
        this.dialogService.open(RegistrationConfirmModalComponent, {
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
            const error = JSON.stringify(e);
            if (error.toString().includes("UsernameExistsException")) {
                this.notificationService.show($localize`User with this email already exists.`);
            } else if (error.includes("UserAlreadyAuthenticatedException")) {
                this.notificationService.show($localize`You are already logged in.`);
            } else {
                console.error(e);
                this.notificationService.show($localize`Error occurred during registration. Please try again later.`);
            }
            this.pending = false;
        }
    }
}
