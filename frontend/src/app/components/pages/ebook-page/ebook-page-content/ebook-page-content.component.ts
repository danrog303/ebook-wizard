import {Component, OnDestroy, OnInit} from '@angular/core';
import {MaterialModule} from "../../../../modules/material.module";
import {EbookPageNavbar} from "../ebook-page-navbar/ebook-page-navbar.component";
import {EbookPageHomeSectionComponent} from "../ebook-page-sections/ebook-page-home-section/ebook-page-home-section.component";
import {ActivatedRoute, NavigationEnd, Router, RouterEvent, RouterModule} from "@angular/router";
import {filter, Observable, Subscription} from "rxjs";
import {NgClass} from "@angular/common";
import {
    EbookPageFilesSectionComponent
} from "../ebook-page-sections/ebook-page-files-section/ebook-page-files-section.component";
import {
    EbookPageLastModifiedSectionComponent
} from "../ebook-page-sections/ebook-page-last-modified-section/ebook-page-last-modified-section.component";
import {
    EbookPageProjectsSectionComponent
} from "../ebook-page-sections/ebook-page-projects-section/ebook-page-projects-section.component";

@Component({
    selector: 'app-ebook-page-content',
    standalone: true,
    imports: [MaterialModule, EbookPageNavbar, EbookPageHomeSectionComponent, RouterModule, NgClass, EbookPageFilesSectionComponent, EbookPageLastModifiedSectionComponent, EbookPageProjectsSectionComponent],
    templateUrl: './ebook-page-content.component.html',
    styleUrl: './ebook-page-content.component.scss'
})
export class EbookPageContent implements OnInit, OnDestroy {
    currentRoute: string = "";
    currentRouteSubscription: Subscription | null = null;

    constructor(private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
        this.currentRouteSubscription = this.route.url.subscribe(url => {
            this.currentRoute = url.map(url => url.path).join("/");
            console.log(this.currentRoute);
        });
    }

    ngOnDestroy() {
        if (this.currentRouteSubscription) {
            this.currentRouteSubscription.unsubscribe();
        }
    }

}
