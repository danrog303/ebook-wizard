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
    userNickname: string = "???";

    nicknameForm = new FormGroup({
        nickname: new FormControl('', [
            Validators.required,
            Validators.minLength(1),
            this.equalsToUserNicknameValidator()
        ])
    });

    actionInProgress: "cleanup" | "delete" | null = null;

    constructor(@Inject(MatDialogRef) private readonly dialogRef: MatDialogRef<AccountDeleteModalComponent>,
                private readonly authService: AuthenticationService,
                private readonly notificationService: NotificationService,
                private readonly accountCleanupService: EbookAccountCleanupService,
                private readonly routerService: Router) {
    }

    ngOnInit() {
        this.authService.fetchAuthenticatedUser().then(user => {
            this.userNickname = user!.nickname;
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

    equalsToUserNicknameValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const nicknameMismatch = control.value !== this.userNickname;
            return nicknameMismatch ? { nicknameMismatch: { value: "Nickname mismatch" } } : null;
        };
    }
}
