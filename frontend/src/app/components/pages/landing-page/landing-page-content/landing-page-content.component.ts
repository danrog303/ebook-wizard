import {Component} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {LandingPageNavbarComponent} from "../landing-page-navbar/landing-page-navbar.component";

@Component({
    selector: 'app-landing-page-content',
    standalone: true,
    imports: [LandingPageNavbarComponent, MatButton, RouterLink],
    templateUrl: './landing-page-content.component.html',
    styleUrl: './landing-page-content.component.scss'
})
export class LandingPageContentComponent {

}
