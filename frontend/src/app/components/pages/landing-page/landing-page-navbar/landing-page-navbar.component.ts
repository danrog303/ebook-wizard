import {Component} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatListModule} from "@angular/material/list";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {RouterModule} from "@angular/router";
import {CommonModule, ViewportScroller} from "@angular/common";

@Component({
    selector: 'app-landing-page-navbar',
    standalone: true,
    templateUrl: './landing-page-navbar.component.html',
    styleUrl: './landing-page-navbar.component.scss',
    imports: [MatListModule, RouterModule, MatButtonModule, MatToolbarModule, MatIconModule, MatSidenavModule, MatTabsModule, CommonModule]
})
export class LandingPageNavbarComponent {
    activeTab: string = 'landing-page-content-header';
    navItems = [
        {anchorId: 'landing-page-content-header', name: 'Home'},
        {anchorId: 'landing-page-content-functionalities', name: 'Functionalities'},
        {anchorId: 'landing-page-content-supported-formats', name: 'Supported formats'},
        {anchorId: 'landing-page-content-cta', name: 'Get started'}
    ]

    constructor(private viewportScroller: ViewportScroller) {}

    scrollToElement(elementId: string): void {
        this.viewportScroller.scrollToAnchor(elementId);
    }

    onTabChange(anchorId: string): void {
        this.activeTab = anchorId;
        this.scrollToElement(anchorId);
    }
}
