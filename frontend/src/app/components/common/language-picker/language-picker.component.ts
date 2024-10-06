import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from "@angular/common";
import MaterialModule from "@app/modules/material.module";
import environment from "@env/environment";
import {MatSelectChange} from "@angular/material/select";

@Component({
    selector: 'app-language-picker',
    standalone: true,
    imports: [MaterialModule, CommonModule, NgOptimizedImage],
    templateUrl: './language-picker.component.html',
    styleUrl: './language-picker.component.scss'
})
export class LanguagePickerComponent {
    readonly languages = [
        {value: 'en', imageUrl: "/assets/country-flags/uk.svg", label: "English", url: environment.FRONTEND_BASE_URI_EN},
        {value: 'pl', imageUrl: "/assets/country-flags/poland.svg", label: "Polski", url: environment.FRONTEND_BASE_URI_PL}
    ]

    getSelectedLanguageKey(): string {
        if (window.location.href.includes(environment.FRONTEND_BASE_URI_PL)) {
            return "pl";
        } else {
            return "en";
        }
    }

    onLanguageChanged(event: MatSelectChange) {
        const path = window.location.pathname;

        if (event.value === "pl") {
            window.location.href = environment.FRONTEND_BASE_URI_PL + path;
        } else {
            window.location.href = environment.FRONTEND_BASE_URI_EN + path;
        }
    }
}
