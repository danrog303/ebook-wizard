import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from "@angular/common";
import MaterialModule from "../../../modules/material.module";

@Component({
    selector: 'app-action-pending-button',
    standalone: true,
    imports: [MaterialModule, CommonModule],
    templateUrl: './action-pending-button.component.html',
    styleUrl: './action-pending-button.component.scss'
})
export default class ActionPendingButtonComponent {
    @Input() pending: boolean = false;
    @Input() disabled: boolean = false;
    @Input() type: ("button" | "submit") = "button";
    @Input() color: string | null = "primary";

    @Output() click = new EventEmitter<void>();
}
