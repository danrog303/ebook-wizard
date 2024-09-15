import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterModule} from "@angular/router";
import {NgOptimizedImage} from "@angular/common";
import {Subscription} from "rxjs";
import LandingPageNavbarComponent from "@app/components/pages/landing-page/navbar/landing-page-navbar.component";
import MaterialModule from "@app/modules/material.module";
import AuthenticationService from "@app/services/authentication.service";

@Component({
    selector: 'app-ebook-page-content',
    standalone: true,
    imports: [LandingPageNavbarComponent, MaterialModule, RouterModule, NgOptimizedImage],
    templateUrl: './landing-page-content.component.html',
    styleUrl: './landing-page-content.component.scss'
})
export class LandingPageContentComponent implements OnInit, OnDestroy {
    isUserAuthenticated: boolean | null = null;
    isUserAuthenticatedSubscription: Subscription | null = null;

    constructor(private authService: AuthenticationService) {}

    ngOnInit(): void {
        this.isUserAuthenticatedSubscription = this.authService.$isUserAuthenticated.subscribe((isAuthenticated) => {
            this.isUserAuthenticated = isAuthenticated;
        });
    }

    ngOnDestroy() {
        if (this.isUserAuthenticatedSubscription && !this.isUserAuthenticatedSubscription.closed) {
            this.isUserAuthenticatedSubscription.unsubscribe();
        }
    }
}
