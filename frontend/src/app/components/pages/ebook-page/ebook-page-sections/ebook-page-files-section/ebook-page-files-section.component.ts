import {Component, OnInit} from '@angular/core';
import EbookFileService from "../../../../../services/ebook-file.service";

@Component({
  selector: 'app-ebook-page-files-section',
  standalone: true,
  imports: [],
  templateUrl: './ebook-page-files-section.component.html',
  styleUrl: './ebook-page-files-section.component.scss'
})
export class EbookPageFilesSectionComponent implements OnInit {
    constructor(private ebookFileService: EbookFileService) {
    }

    ngOnInit() {
        this.ebookFileService.listEbookFilesOfAuthenticatedUser().subscribe(files => {
            console.log("PRINTUJE filesy");
            console.log(files);
        });
    }
}
