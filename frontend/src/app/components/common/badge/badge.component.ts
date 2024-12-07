import {Component, Input} from '@angular/core';
import {NgStyle} from "@angular/common";

@Component({
    selector: 'app-badge',
    standalone: true,
    imports: [
        NgStyle
    ],
    templateUrl: './badge.component.html',
    styleUrl: './badge.component.scss'
})
export class BadgeComponent {
    @Input() color: string = '#fff';
    @Input() backgroundColor: string = '#007bff';
}
