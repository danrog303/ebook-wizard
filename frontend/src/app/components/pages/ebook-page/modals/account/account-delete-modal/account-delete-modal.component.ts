import {Component, Inject, OnInit} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatDialogRef} from "@angular/material/dialog";
import AuthenticationService from "@app/services/authentication.service";
import NotificationService from "@app/services/notification.service";
import EbookAccountCleanupService from "@app/services/ebook-account-cleanup.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-account-delete-modal',
    standalone: true,
    imports: [
        MaterialModule,
        ReactiveFormsModule,
        CommonModule
    ],
    templateUrl: './account-delete-modal.component.html',
    styleUrl: './account-delete-modal.component.scss'
})
export class AccountDeleteModalComponent implements OnInit {
    userEmail: string = "";

    emailForm = new FormGroup({
        email: new FormControl('', [
            Validators.required,
            Validators.email,
            this.equalsToUserEmailValidator()
        ])
    });

    actionInProgress: "cleanup" | "delete" | null = null;

    constructor(@Inject(MatDialogRef) private dialogRef: MatDialogRef<AccountDeleteModalComponent>,
                private authService: AuthenticationService,
                private notificationService: NotificationService,
                private accountCleanupService: EbookAccountCleanupService,
                private routerService: Router) {
    }

    ngOnInit() {
        this.authService.fetchAuthenticatedUser().then(user => {
            this.userEmail = user!.email;
        });
    }

    async onDeleteAccount() {
        try {
            this.actionInProgress = "cleanup";
            await this.accountCleanupService.cleanupAccount();
            this.actionInProgress = "delete";
            await this.authService.deleteUser();
            this.dialogRef.close();
            this.notificationService.show($localize`Account deleted successfully.`);
            await this.routerService.navigate(["/"]);
            location.reload();
        } catch {
            this.notificationService.show($localize`Fatal error during ${this.actionInProgress} operation.`);
            this.actionInProgress = null;
        }
    }

    equalsToUserEmailValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const emailMismatch = control.value !== this.userEmail;
            return emailMismatch ? { emailMismatch: { value: "Email mismatch" } } : null;
        };
    }
}
