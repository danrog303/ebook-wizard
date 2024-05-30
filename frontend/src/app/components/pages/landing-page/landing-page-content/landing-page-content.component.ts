import {Component} from '@angular/core';
import {RouterModule} from "@angular/router";
import {LandingPageNavbarComponent} from "../landing-page-navbar/landing-page-navbar.component";
import {MaterialModule} from "../../../../modules/material.module";
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-landing-page-content',
    standalone: true,
    imports: [LandingPageNavbarComponent, MaterialModule, RouterModule, NgOptimizedImage],
    templateUrl: './landing-page-content.component.html',
    styleUrl: './landing-page-content.component.scss'
})
export class LandingPageContentComponent {

}
