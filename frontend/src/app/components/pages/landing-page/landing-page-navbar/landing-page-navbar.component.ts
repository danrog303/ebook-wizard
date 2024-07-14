import {Component, HostListener} from '@angular/core';
import {RouterModule} from "@angular/router";
import {CommonModule, NgOptimizedImage, ViewportScroller} from "@angular/common";
import {MaterialModule} from "../../../../modules/material.module";
import {AuthenticationService} from "../../../../services/authentication.service";
import {LogoutButtonComponent} from "../../../common/logout-button/logout-button.component";

@Component({
    selector: 'app-landing-page-navbar',
    standalone: true,
    templateUrl: './landing-page-navbar.component.html',
    styleUrl: './landing-page-navbar.component.scss',
    imports: [MaterialModule, RouterModule, CommonModule, LogoutButtonComponent, NgOptimizedImage]
})
export class LandingPageNavbarComponent {
    activeTab: string = 'landing-page-content-header';
    navItems = [
        {anchorId: 'landing-page-header', name: 'Home'},
        {anchorId: 'landing-page-functionalities', name: 'Functionalities'},
        {anchorId: 'landing-page-supported-formats', name: 'Supported formats'},
        {anchorId: 'landing-page-cta', name: 'Get started'}
    ]

    constructor(public viewportScrollerService: ViewportScroller,
                public authenticationService: AuthenticationService) {}

    scrollToElement(elementId: string): void {
        console.log("Scrolling to: ", elementId);
        this.viewportScrollerService.scrollToAnchor(elementId);
    }

    onTabChange(anchorId: string): void {
        this.activeTab = anchorId;
        this.scrollToElement(anchorId);
    }

    @HostListener('window:scroll', ['$event']) // for window scroll events
    onScroll(event: Event) {
        for (let navItem of this.navItems.slice().reverse()) {
            const element = document.getElementById(navItem.anchorId);
            if (element && this.isElementInViewport(element)) {
                this.activeTab = navItem.anchorId;
            }
        }
    }

    isElementInViewport (element: HTMLElement) {
        const rect = element.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
        );
    }

}
