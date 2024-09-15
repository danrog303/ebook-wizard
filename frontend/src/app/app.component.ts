import {Component, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    constructor(private titleService: Title) {
    }

    ngOnInit() {
        this.titleService.setTitle($localize`ebook-wizard | free and secure e-book drive`);
    }
}
