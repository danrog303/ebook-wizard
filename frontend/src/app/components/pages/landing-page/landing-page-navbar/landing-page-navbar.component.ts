import {Component} from '@angular/core';
import {RouterModule} from "@angular/router";
import {CommonModule, ViewportScroller} from "@angular/common";
import {MaterialModule} from "../../../../modules/material.module";

@Component({
    selector: 'app-landing-page-navbar',
    standalone: true,
    templateUrl: './landing-page-navbar.component.html',
    styleUrl: './landing-page-navbar.component.scss',
    imports: [MaterialModule, RouterModule, CommonModule]
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
