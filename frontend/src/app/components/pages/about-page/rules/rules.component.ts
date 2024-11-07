import { Component } from '@angular/core';
import {NgIf} from "@angular/common";
import {PdfViewerComponent} from "@app/components/common/pdf-viewer/pdf-viewer.component";

@Component({
    selector: 'app-rules',
    standalone: true,
    imports: [
        NgIf,
        PdfViewerComponent
    ],
    templateUrl: './rules.component.html',
    styleUrl: './rules.component.scss'
})
export class RulesComponent {

}
