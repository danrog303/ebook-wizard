import {Component} from '@angular/core';
import {RouterLink} from "@angular/router";
import MaterialModule from "@app/modules/material.module";

@Component({
  selector: 'app-ebook-page-home-section',
  standalone: true,
    imports: [MaterialModule, RouterLink],
  templateUrl: './ebook-page-home-section.component.html',
  styleUrl: './ebook-page-home-section.component.scss'
})
export class EbookPageHomeSectionComponent {

}
