import { Component } from '@angular/core';
import {MaterialModule} from "../../../../../modules/material.module";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-ebook-page-home-section',
  standalone: true,
    imports: [MaterialModule, RouterLink],
  templateUrl: './ebook-page-home-section.component.html',
  styleUrl: './ebook-page-home-section.component.scss'
})
export class EbookPageHomeSectionComponent {

}
