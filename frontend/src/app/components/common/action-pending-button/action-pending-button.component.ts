import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MaterialModule} from "../../../modules/material.module";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'app-action-pending-button',
    standalone: true,
    imports: [MaterialModule, CommonModule],
    templateUrl: './action-pending-button.component.html',
    styleUrl: './action-pending-button.component.scss'
})
export class ActionPendingButtonComponent {
    @Input() pending: boolean = false;
    @Input() disabled: boolean = false;
    @Input() type: ("button" | "submit") = "button";
    @Input() color: string | null = "primary";

    @Output() click = new EventEmitter<void>();
}
