import {Component, OnInit} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import EbookWizardStatisticsService from "@app/services/ebook-wizard-statistics.service";
import EbookWizardStatistics from "@app/models/ebook/ebook-wizard-statistics.model";
import LoadingStatus from "@app/models/misc/loading-status.enum";

@Component({
    selector: 'app-stats-display',
    standalone: true,
    imports: [MaterialModule],
    templateUrl: './stats-display.component.html',
    styleUrl: './stats-display.component.scss'
})
export class StatsDisplayComponent implements OnInit {
    loadingStatus: LoadingStatus = LoadingStatus.NOT_STARTED;
    websiteStats: EbookWizardStatistics | null = null;

    constructor(private statsService: EbookWizardStatisticsService) {
    }

    ngOnInit() {
        this.loadingStatus = LoadingStatus.LOADING;
        this.statsService.getStatistics().subscribe({
            next: stats => {
                this.websiteStats = stats;
                this.loadingStatus = LoadingStatus.LOADED;
            },
            error: error => {
                this.loadingStatus = LoadingStatus.ERROR;
            }
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
}
