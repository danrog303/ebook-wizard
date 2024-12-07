import {Component, Input} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

export interface PageJumpMenuContext {
    changePage: (pageNumber: number) => void;
    getMaxPage: () => number;
}

@Component({
    selector: 'app-page-jump-menu',
    standalone: true,
    imports: [MaterialModule, ReactiveFormsModule],
    templateUrl: './page-jump-menu.component.html',
    styleUrl: './page-jump-menu.component.scss'
})
export class PageJumpMenuComponent {
    @Input() context: PageJumpMenuContext | null = null;

    pageJumpForm = new FormGroup({
        pageNumber: new FormControl(1, [Validators.min(1)])
    });

    onSubmitPageJumpForm() {
        let pageNumber = this.pageJumpForm.get('pageNumber')?.value;
        const maxPage = this.context?.getMaxPage();

        if (pageNumber! > maxPage!) {
            pageNumber = maxPage;
        }

        this.context?.changePage(pageNumber!);
    }
}
