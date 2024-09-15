import {Component, HostListener} from '@angular/core';
import {RouterModule} from "@angular/router";
import {CommonModule, NgOptimizedImage, ViewportScroller} from "@angular/common";
import MaterialModule from "@app/modules/material.module";
import AuthenticationService from "@app/services/authentication.service";
import LogoutButtonComponent from "@app/components/common/logout-button/logout-button.component";
import '@angular/localize/init';

@Component({
    selector: 'app-landing-page-navbar',
    standalone: true,
    templateUrl: './landing-page-navbar.component.html',
    styleUrl: './landing-page-navbar.component.scss',
    imports: [MaterialModule, RouterModule, CommonModule, LogoutButtonComponent, NgOptimizedImage]
})
export default class LandingPageNavbarComponent {
    activeTab: string = 'ebook-page-content-header';
    navItems = [
        {anchorId: 'landing-page-header', name: $localize`Home`},
        {anchorId: 'landing-page-functionalities', name: $localize`Functionalities`},
        {anchorId: 'landing-page-supported-formats', name: $localize`Supported formats`},
        {anchorId: 'landing-page-cta', name: $localize`Get started`}
    ]

    constructor(public viewportScrollerService: ViewportScroller,
                public authenticationService: AuthenticationService) {}

    scrollToElement(elementId: string): void {
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
