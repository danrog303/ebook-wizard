import { Component } from '@angular/core';
import {RouterModule} from "@angular/router";
import {MaterialModule} from "../../../modules/material.module";
import {NgOptimizedImage} from "@angular/common";

@Component({
    selector: 'app-not-found-page',
    standalone: true,
    imports: [RouterModule, MaterialModule, NgOptimizedImage],
    templateUrl: './not-found-page.component.html',
    styleUrl: './not-found-page.component.scss'
})
export class NotFoundPageComponent {

}
