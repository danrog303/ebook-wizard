import {Component, OnInit} from '@angular/core';
import {RecaptchaModule} from "ng-recaptcha";
import {RouterModule} from "@angular/router";
import {MaterialModule} from "../../../modules/material.module";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import env from "../../../../environments/environment";
import passwordStrengthValidator from "../../../validators/password-strength.validator";
import passwordMatchValidator from "../../../validators/password-match.validate";

@Component({
    selector: 'app-registration-page',
    standalone: true,
    templateUrl: './registration-page.component.html',
    styleUrl: './registration-page.component.scss',
    imports: [MaterialModule, RouterModule, RecaptchaModule, ReactiveFormsModule]
})
export class RegistrationPageComponent {
    pending = false;
    recaptchaSiteKey = env.RECAPTCHA_SITE_KEY;
    registerForm: FormGroup;

    constructor() {
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

        console.log(this.registerForm);
    }

    onRegisterSubmit() {
        this.pending = true;
        setInterval(() => {
            this.pending = false;
        }, 3000);
    }
}
