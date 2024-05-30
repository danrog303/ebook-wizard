import {Component, OnInit} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatIcon} from "@angular/material/icon";
import {CommonModule} from "@angular/common";
import {MaterialModule} from "../../../modules/material.module";

@Component({
    selector: 'app-login-page',
    standalone: true,
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
    imports: [CommonModule, MaterialModule, RouterLink, ReactiveFormsModule],
})
export class LoginPageComponent {
    loginForm: FormGroup;
    pending: boolean = false;

    constructor() {
        this.loginForm = new FormGroup({
            'email': new FormControl(null, [Validators.required, Validators.email]),
            'password': new FormControl(null, [Validators.required])
        });
    }

    onLoginSubmit() {
        this.pending = true;
        setInterval(() => {
            this.pending = false;
        }, 3000);
    }
}
