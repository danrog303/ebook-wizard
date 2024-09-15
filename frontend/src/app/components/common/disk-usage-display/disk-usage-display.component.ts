import {Component, OnInit} from '@angular/core';
import MaterialModule from "@app/modules/material.module";
import DiskUsageService from "@app/services/disk-usage.service";
import StringUtilsService from "@app/services/string-utils.service";

@Component({
  selector: 'app-disk-usage-display',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './disk-usage-display.component.html',
  styleUrl: './disk-usage-display.component.scss'
})
export class DiskUsageDisplayComponent implements OnInit {
    limitBytes: number | null = null;
    usageBytes: number | null = null;

    usagePercentage: number | null = null;

    constructor(private diskUsageService: DiskUsageService,
                public stringUtils: StringUtilsService) {
    }

    ngOnInit() {
        this.diskUsageService.getDiskUsageBytes().subscribe((usage: number) => {
            this.usageBytes = usage;
            this.updateUsagePercentage();
        });

        this.diskUsageService.getDiskLimitBytes().subscribe((limit: number) => {
            this.limitBytes = limit;
            this.updateUsagePercentage();
        });
    }

    updateUsagePercentage() {
        if (this.usageBytes !== null && this.limitBytes !== null) {
            this.usagePercentage = this.usageBytes / this.limitBytes * 100;
        }
    }
}
