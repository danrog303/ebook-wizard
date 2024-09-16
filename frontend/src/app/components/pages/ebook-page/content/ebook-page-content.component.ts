import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgClass, NgOptimizedImage} from "@angular/common";
import {Subscription} from "rxjs";

import MaterialModule from "@app/modules/material.module";
import {EbookPageNavbar} from "@app/components/pages/ebook-page/navbar/ebook-page-navbar.component";
import {EbookPageHomeSectionComponent} from "@app/components/pages/ebook-page/sections/home-section/ebook-page-home-section.component";
import {ActivatedRoute, Router, RouterModule} from "@angular/router";
import {EbookPageFilesSectionComponent} from "@app/components/pages/ebook-page/sections/files-section/ebook-page-files-section.component";
import {EbookPageLastModifiedSectionComponent} from "@app/components/pages/ebook-page/sections/last-modified-section/ebook-page-last-modified-section.component";
import {EbookPageProjectsSectionComponent} from "@app/components/pages/ebook-page/sections/projects-section/ebook-page-projects-section.component";
import {DiskUsageDisplayComponent} from "@app/components/common/disk-usage-display/disk-usage-display.component";
import LogoutButtonComponent from "@app/components/common/logout-button/logout-button.component";
import {
    AccountManagerSectionComponent
} from "@app/components/pages/ebook-page/sections/account-manager-section/account-manager-section.component";

@Component({
    selector: 'app-ebook-page-content',
    standalone: true,
    imports: [MaterialModule, EbookPageNavbar, EbookPageHomeSectionComponent, RouterModule, NgClass, EbookPageFilesSectionComponent, EbookPageLastModifiedSectionComponent, EbookPageProjectsSectionComponent, DiskUsageDisplayComponent, NgOptimizedImage, LogoutButtonComponent, AccountManagerSectionComponent],
    templateUrl: './ebook-page-content.component.html',
    styleUrl: './ebook-page-content.component.scss'
})
export class EbookPageContent implements OnInit, OnDestroy {
    currentRoute: string = "";
    currentRouteSubscription: Subscription | null = null;

    constructor(private route: ActivatedRoute,
                private router: Router) {}

    ngOnInit() {
        this.currentRouteSubscription = this.route.url.subscribe(url => {
            this.currentRoute = url.map(url => url.path).join("/");
        });
    }

    ngOnDestroy() {
        if (this.currentRouteSubscription) {
            this.currentRouteSubscription.unsubscribe();
        }
    }

    async openNewEbookProjectCreator() {
        await this.router.navigate(["/ebook-project"], {queryParams: {modal: "creator"}});
    }

    async openNewEbookFileCreator() {
        await this.router.navigate(["/ebook-file"], {queryParams: {modal: "creator"}});
    }

    openAboutWebsitePage() {
        window.open("/about", "_blank");
    }
}
