import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";

import ActionPendingButtonComponent from "@app/components/common/action-pending-button/action-pending-button.component";
import MaterialModule from "@app/modules/material.module";
import EbookProject, {createEmptyEbookProject} from "@app/models/ebook-project/ebook-project.model";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import EbookProjectService from "@app/services/ebook-project.service";
import NotificationService from "@app/services/notification.service";
import structuredClone from "@ungap/structured-clone";

@Component({
    selector: 'app-ebook-project-meta-edit-form',
    standalone: true,
    imports: [CommonModule, ActionPendingButtonComponent, MaterialModule, ReactiveFormsModule],
    templateUrl: './ebook-project-meta-edit-form.component.html',
    styleUrl: './ebook-project-meta-edit-form.component.scss'
})
export class EbookProjectMetaEditFormComponent implements OnChanges {
    ebookProjectUpdateProgress: LoadingStatus = LoadingStatus.NOT_STARTED;

    @Input() ebookProject: EbookProject = createEmptyEbookProject();
    @Input() mode: "create" | "edit" = "create";
    @Output() updateEbookProject = new EventEmitter<EbookProject>();

    metadataForm = new FormGroup({
        name: new FormControl("", [Validators.required, Validators.minLength(2)]),
        author: new FormControl("", [Validators.required, Validators.minLength(2)]),
        description: new FormControl(""),
        tags: new FormControl([] as string[]),
    });

    constructor(private ebookProjectService: EbookProjectService,
                private notificationService: NotificationService) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["ebookProject"]) {
            try {
                this.metadataForm.patchValue({
                    name: this.ebookProject.name,
                    author: this.ebookProject.author,
                    description: this.ebookProject.description,
                });
            } catch (e) {
                console.error(e);
            }
        }
    }

    deleteEbookProjectTag(tag: string) {
        const index = this.ebookProject?.tags.indexOf(tag);

        if (index !== undefined && index !== -1) {
            this.ebookProject?.tags.splice(index, 1);
        }
    }

    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    addEbookProjectTag(event: MatChipInputEvent) {
        const value = (event.value || '').trim();

        if (value && !this.ebookProject?.tags.includes(value)) {
            this.ebookProject?.tags.push(value);
        }

        event.chipInput!.clear();
    }

    updateEbookProjectMeta() {
        if (this.ebookProjectUpdateProgress === LoadingStatus.LOADING) {
            return;
        }

        this.ebookProjectUpdateProgress = LoadingStatus.LOADING;

        // Update name, author and description fields
        // Field "tags" is already updated inside "addEbookFileTag" handler
        let ebookProject = structuredClone(this.ebookProject);
        ebookProject.name = this.metadataForm.get('name')?.value || "Unknown name";
        ebookProject.author = this.metadataForm.get('author')?.value || "Unknown author";
        ebookProject.description = this.metadataForm.get('description')?.value || "";

        let method;
        if (this.mode === "create") {
            method = () => this.ebookProjectService.createEmptyEbookProject(ebookProject);
        } else {
            method = () => this.ebookProjectService.updateEbookProject(ebookProject.id, ebookProject);
        }

        method().subscribe({
            next: (ebookProject: EbookProject) => {
                this.ebookProjectUpdateProgress = LoadingStatus.LOADED;
                this.ebookProject = ebookProject;
                this.updateEbookProject.emit(ebookProject);
            },
            error: () => {
                this.ebookProjectUpdateProgress = LoadingStatus.ERROR;
                this.notificationService.show($localize`Failed to set metadata of the ebook project. Refresh the page and try again.`);
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
