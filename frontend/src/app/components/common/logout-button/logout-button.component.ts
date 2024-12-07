import {Component} from '@angular/core';
import {Router} from "@angular/router";

import MaterialModule from "@app/modules/material.module";
import AuthenticationService from "@app/services/authentication.service";
import NotificationService from "@app/services/notification.service";

@Component({
    selector: 'app-logout-button',
    standalone: true,
    imports: [MaterialModule],
    templateUrl: './logout-button.component.html',
    styleUrl: './logout-button.component.scss'
})
export default class LogoutButtonComponent {
    logoutPending = false;

    constructor(private readonly authService: AuthenticationService,
                private readonly notificationService: NotificationService,
                private readonly router: Router) {
    }

    async onLogout() {
        this.logoutPending = true;

        try {
            await this.authService.signOut();
            this.notificationService.show($localize`You have been logged out.`);
        } catch (e: any) {
            console.error(e);
            this.notificationService.show($localize`An error occurred while logging out.`);
        }

        this.logoutPending = false;
        await this.router.navigate(['/']);
    }
}
