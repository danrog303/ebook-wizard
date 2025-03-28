import {Component} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import MaterialModule from "@app/modules/material.module";
import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import AuthenticationService from "@app/services/authentication.service";
import RegistrationConfirmModalComponent from "@app/components/pages/registration-page/confirm-modal/registration-confirm-modal.component";
import NotificationService from "@app/services/notification.service";

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

    hidePassword = true;

    constructor(private readonly cognitoService: AuthenticationService,
                private readonly dialogService: MatDialog,
                private readonly notificationService: NotificationService,
                private readonly routerService: Router,
                private readonly activatedRoute: ActivatedRoute) {
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

            this.notificationService.show($localize`You have successfuly logged in.`);
        } catch(e: any) {
            const error = JSON.stringify(e);
            if (error.includes("NotAuthorizedException")) {
                this.notificationService.show($localize`Invalid email or password.`);
            } else if (error.toString().includes("CONFIRM_SIGN_UP")) {
                this.dialogService.open(RegistrationConfirmModalComponent, {
                    data: {
                        userEmail: this.loginForm.controls['email'].value
                    },
                    disableClose: true
                });
            } else if (error.includes("UserAlreadyAuthenticatedException")) {
                this.notificationService.show($localize`You are already logged in.`);
                this.routerService.navigateByUrl("/ebook").then();
            } else {
                console.error(e);
                this.notificationService.show($localize`An error occurred while signing in.`);
            }
            this.loginPending = false;
        }
    }
}
