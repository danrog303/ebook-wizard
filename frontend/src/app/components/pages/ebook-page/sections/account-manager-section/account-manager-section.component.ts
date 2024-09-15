import {Component, OnInit} from '@angular/core';
import AuthenticationService, {AuthenticatedUser} from "@app/services/authentication.service";
import {MatDivider} from "@angular/material/divider";
import GravatarService from "@app/services/gravatar.service";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import MaterialModule from "@app/modules/material.module";
import {CommonModule} from "@angular/common";
import DiskUsageService from "@app/services/disk-usage.service";
import {firstValueFrom} from "rxjs";
import StringUtilsService from "@app/services/string-utils.service";
import {MatDialog} from "@angular/material/dialog";
import {
    NicknameChangeModalComponent
} from "@app/components/pages/ebook-page/modals/account/nickname-change-modal/nickname-change-modal.component";
import {
    EmailChangeModalComponent
} from "@app/components/pages/ebook-page/modals/account/email-change-modal/email-change-modal.component";
import {
    AccountDeleteModalComponent
} from "@app/components/pages/ebook-page/modals/account/account-delete-modal/account-delete-modal.component";
import LogoutButtonComponent from "@app/components/common/logout-button/logout-button.component";
import {
    PasswordChangeModalComponent
} from "@app/components/pages/ebook-page/modals/account/password-change-modal/password-change-modal.component";

@Component({
    selector: 'app-account-manager-section',
    standalone: true,
    imports: [
        MaterialModule, CommonModule, LogoutButtonComponent
    ],
    templateUrl: './account-manager-section.component.html',
    styleUrl: './account-manager-section.component.scss'
})
export class AccountManagerSectionComponent implements OnInit {
    loadStatus: LoadingStatus = LoadingStatus.NOT_STARTED;

    user: AuthenticatedUser | undefined = undefined;
    uid: string | undefined = undefined;
    gravatarUrl: string | undefined = undefined;
    diskLimitBytes: number | undefined = undefined;

    constructor(private authService: AuthenticationService,
                private gravatarService: GravatarService,
                private diskUsageService: DiskUsageService,
                public stringUtils: StringUtilsService,
                private dialogService: MatDialog) {
    }

    async ngOnInit() {
        try {
            this.loadStatus = LoadingStatus.LOADING;
            this.user = await this.authService.fetchAuthenticatedUser() ?? undefined;
            this.uid = await this.authService.getUserId();
            this.gravatarUrl = await this.gravatarService.getGravatarUrl(this.user?.email ?? '');
            this.diskLimitBytes = await firstValueFrom(this.diskUsageService.getDiskLimitBytes());
            this.loadStatus = LoadingStatus.LOADED;
        } catch {
            this.loadStatus = LoadingStatus.ERROR;
        }
    }

    openChangeEmailDialog() {
        this.dialogService.open(EmailChangeModalComponent, {
            autoFocus: false
        });
    }

    openNicknameEditDialog() {
        this.dialogService.open(NicknameChangeModalComponent, {
            autoFocus: true
        });
    }

    openAccountDeletionDialog() {
        this.dialogService.open(AccountDeleteModalComponent, {
            autoFocus: true
        });
    }

    openPasswordChangeDialog() {
        this.dialogService.open(PasswordChangeModalComponent, {
            autoFocus: true
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
