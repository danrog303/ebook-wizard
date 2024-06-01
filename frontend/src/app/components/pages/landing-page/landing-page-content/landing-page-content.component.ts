import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterModule} from "@angular/router";
import {LandingPageNavbarComponent} from "../landing-page-navbar/landing-page-navbar.component";
import {MaterialModule} from "../../../../modules/material.module";
import {NgOptimizedImage} from "@angular/common";
import {AuthenticationService} from "../../../../services/authentication.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-landing-page-content',
    standalone: true,
    imports: [LandingPageNavbarComponent, MaterialModule, RouterModule, NgOptimizedImage],
    templateUrl: './landing-page-content.component.html',
    styleUrl: './landing-page-content.component.scss'
})
export class LandingPageContentComponent implements OnInit, OnDestroy {
    isUserAuthenticated: boolean = false;
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
