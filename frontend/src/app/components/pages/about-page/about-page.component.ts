import {Component, OnInit} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";
import AuthenticationService from "@app/services/authentication.service";

@Component({
  selector: 'app-about-page',
  standalone: true,
    imports: [
        NgOptimizedImage,
        RouterLink
    ],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss'
})
export class AboutPageComponent implements OnInit {
    isUserAuthenticated: boolean = false;

    constructor(private authenticationService: AuthenticationService) {}

    ngOnInit(): void {
        this.authenticationService.isUserAuthenticated().then(isAuthenticated => {
            this.isUserAuthenticated = isAuthenticated;
        });
    }
}
