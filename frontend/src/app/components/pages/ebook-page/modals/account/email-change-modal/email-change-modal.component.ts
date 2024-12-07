import {AfterViewInit, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {MatStepper} from "@angular/material/stepper";
import MaterialModule from "@app/modules/material.module";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatInput} from "@angular/material/input";
import AuthenticationService from "@app/services/authentication.service";
import NotificationService from "@app/services/notification.service";

@Component({
    selector: 'app-email-change-modal',
    standalone: true,
    imports: [
        MaterialModule,
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './email-change-modal.component.html',
    styleUrl: './email-change-modal.component.scss'
})
export class EmailChangeModalComponent implements AfterViewInit {
    emailForm = new FormGroup({
        email: new FormControl('', [
            Validators.required,
            Validators.email
        ])
    });

    verificationCodeForm = new FormGroup({
        verificationCode: new FormControl('', [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(6)
        ])
    });

    @ViewChild("stepper") stepper: MatStepper | undefined;
    @ViewChild("emailInput") emailInput: ElementRef<MatInput> | undefined;
    @ViewChild("verificationCodeInput") verificationCodeInput: ElementRef<MatInput> | undefined;
    currentEmail: string = "";

    constructor(@Inject(MatDialogRef) private readonly dialogRef: MatDialogRef<EmailChangeModalComponent>,
                private readonly authService: AuthenticationService,
                private readonly notificationService: NotificationService) {
    }

    ngAfterViewInit() {
        this.emailInput?.nativeElement.focus();

        this.authService.fetchAuthenticatedUser().then(user => {
            this.currentEmail = user!.email;
        });
    }

    async onEmailFormSubmitted() {
        const email = this.emailForm.value.email!;
        if (email === this.currentEmail) {
            this.notificationService.show($localize`This is already your current email.`);
            return;
        }

        try {
            await this.authService.updateEmail(email);
            this.stepper?.next();
            this.notificationService.show($localize`Confirmation code was sent to ${email}.`);
            this.verificationCodeInput?.nativeElement.focus();
        } catch {
            this.notificationService.show($localize`Failed to update the email. Refresh the page and try again.`);
        }
    }

    async onVerificationCodeFormSubmitted() {
        try {
            const verificationCode = this.verificationCodeForm.value.verificationCode!;
            await this.authService.confirmUpdateEmail(verificationCode);
            this.dialogRef.close();
            this.notificationService.show($localize`Email updated successfully.`);
            location.reload();
        } catch(e: any) {
            if (e.toString().includes("CodeMismatchException")) {
                this.notificationService.show($localize`Invalid confirmation code.`);
            } else {
                this.notificationService.show($localize`Failed to update the email. Refresh the page and try again.`);
            }
        }
    }
}
