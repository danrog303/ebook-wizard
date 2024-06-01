import {Component} from '@angular/core';
import {MaterialModule} from "../../../modules/material.module";
import {AuthenticationService} from "../../../services/authentication.service";
import {NotificationService} from "../../../services/notification.service";

@Component({
    selector: 'app-logout-button',
    standalone: true,
    imports: [MaterialModule],
    templateUrl: './logout-button.component.html',
    styleUrl: './logout-button.component.scss'
})
export class LogoutButtonComponent {
    logoutPending = false;

    constructor(private authService: AuthenticationService,
                private notificationService: NotificationService) {
    }

    async onLogout() {
        this.logoutPending = true;

        try {
            await this.authService.signOut();
            this.notificationService.show("You have been logged out.");
        } catch (e: any) {
            console.error(e);
            this.notificationService.show("An error occurred while logging out.");
        }

        this.logoutPending = false;
    }
}
