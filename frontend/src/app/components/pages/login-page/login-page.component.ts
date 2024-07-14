import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MaterialModule} from "../../../modules/material.module";
import {ActionPendingButtonComponent} from "../../common/action-pending-button/action-pending-button.component";
import {AuthenticationService} from "../../../services/authentication.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {
    RegistrationConfirmModalComponent
} from "../registration-page/registration-confirm-modal/registration-confirm-modal.component";
import {NotificationService} from "../../../services/notification.service";

@Component({
    selector: 'app-login-page',
    standalone: true,
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
    imports: [CommonModule, MaterialModule, RouterModule, ReactiveFormsModule, ActionPendingButtonComponent],
})
export class LoginPageComponent {
    loginForm: FormGroup;
    loginPending: boolean = false;

    constructor(private cognitoService: AuthenticationService,
                private dialogService: MatDialog,
                private notificationService: NotificationService,
                private routerService: Router,
                private activatedRoute: ActivatedRoute) {
        this.loginForm = new FormGroup({
            'email': new FormControl(null, [Validators.required, Validators.email]),
            'password': new FormControl(null, [Validators.required])
        });
    }

    async onLoginSubmit() {
        this.loginPending = true;

        try {
            await this.cognitoService.signIn(this.loginForm.value.email, this.loginForm.value.password);
            this.loginPending = false;

            this.routerService
                .navigateByUrl(this.activatedRoute.snapshot.queryParamMap.get("redirect") ?? "/")
                .then();

            this.notificationService.show('You have successfuly logged in.');
        } catch(e: any) {
            if (e.toString().includes("NotAuthorizedException")) {
                this.notificationService.show("Invalid email or password.");
            } else if (e.toString().includes("CONFIRM_SIGN_UP")) {
                const dialogRef = this.dialogService.open(RegistrationConfirmModalComponent, {
                    data: {
                        userEmail: this.loginForm.controls['email'].value
                    },
                    disableClose: true
                });
            }
            else {
                console.error(e);
                this.notificationService.show("An error occurred while signing in.");
            }
            this.loginPending = false;
        }
    }
}
