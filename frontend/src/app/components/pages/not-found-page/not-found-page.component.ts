import {Component} from '@angular/core';
import {RouterModule} from "@angular/router";
import {NgOptimizedImage} from "@angular/common";
import MaterialModule from "@app/modules/material.module";

@Component({
    selector: 'app-not-found-page',
    standalone: true,
    imports: [RouterModule, MaterialModule, NgOptimizedImage],
    templateUrl: './not-found-page.component.html',
    styleUrl: './not-found-page.component.scss'
})
export class NotFoundPageComponent {

}
