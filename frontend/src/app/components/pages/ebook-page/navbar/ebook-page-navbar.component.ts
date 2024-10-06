import {Component} from '@angular/core';
import {RouterModule} from "@angular/router";
import {CommonModule, NgOptimizedImage} from "@angular/common";
import MaterialModule from "@app/modules/material.module";
import LogoutButtonComponent from "@app/components/common/logout-button/logout-button.component";
import {LanguagePickerComponent} from "@app/components/common/language-picker/language-picker.component";

@Component({
    selector: 'app-ebook-page-navbar',
    standalone: true,
    templateUrl: './ebook-page-navbar.component.html',
    styleUrl: './ebook-page-navbar.component.scss',
    imports: [MaterialModule, RouterModule, CommonModule, LogoutButtonComponent, NgOptimizedImage, LanguagePickerComponent]
})
export class EbookPageNavbar {

}
