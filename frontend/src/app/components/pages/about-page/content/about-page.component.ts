import {Component, OnInit} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import AuthenticationService from "@app/services/authentication.service";
import MaterialModule from "@app/modules/material.module";
import {RulesComponent} from "@app/components/pages/about-page/rules/rules.component";
import {StatsDisplayComponent} from "@app/components/pages/about-page/stats-display/stats-display.component";

@Component({
    selector: 'app-about-page',
    standalone: true,
    imports: [
        NgOptimizedImage,
        RouterLink,
        MaterialModule,
        RulesComponent,
        StatsDisplayComponent
    ],
    templateUrl: './about-page.component.html',
    styleUrl: './about-page.component.scss'
})
export class AboutPageComponent implements OnInit {
    isUserAuthenticated: boolean = false;

    constructor(private readonly authenticationService: AuthenticationService) {}

    ngOnInit(): void {
        this.authenticationService.isUserAuthenticated().then(isAuthenticated => {
            this.isUserAuthenticated = isAuthenticated;
        });
    }
}
