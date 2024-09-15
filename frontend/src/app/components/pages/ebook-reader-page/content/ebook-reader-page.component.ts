import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {AsyncPipe, NgOptimizedImage} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {Subscription} from "rxjs";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import EbookFileService from "@app/services/ebook-file.service";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import MaterialModule from "@app/modules/material.module";
import EbookFormat from "@app/models/ebook/ebook-format.enum";
import SafePipe from "@app/pipes/safe.pipe";
import AuthenticationService from "@app/services/authentication.service";
import EbookDisplayComponent from "@app/components/pages/ebook-reader-page/ebook-display/ebook-display.component";
import {BreakpointObserver} from "@angular/cdk/layout";
import {MatDialog} from "@angular/material/dialog";
import {
    EbookReaderSmModalComponent
} from "@app/components/pages/ebook-reader-page/modal/ebook-reader-sm-modal.component";

@Component({
    selector: 'app-ebook-reader-page',
    standalone: true,
    imports: [FormsModule, MaterialModule, NgOptimizedImage, RouterLink, SafePipe, AsyncPipe, EbookDisplayComponent],
    templateUrl: './ebook-reader-page.component.html',
    styleUrl: './ebook-reader-page.component.scss'
})
export class EbookReaderPageComponent implements OnInit, OnDestroy {
    routeSubscription: Subscription | null = null;

    ebookFile: EbookFile | null = null;
    ebookFileId = '';
    ebookFileLoadingStatus: LoadingStatus = LoadingStatus.NOT_STARTED;
    ebookFileLoadingError: "not-found" | "unauthorized" | null = null;

    isUserAuthenticated: boolean | null = null;
    isUserOwner: boolean | null = null;

    chosenFormat: EbookFormat | null = null;

    isSmallScreen: boolean = false;

    constructor(private activatedRoute: ActivatedRoute,
                private ebookFileService: EbookFileService,
                private authService: AuthenticationService,
                private breakpointObserver: BreakpointObserver,
                private matDialog: MatDialog) {
    }

    async ngOnInit() {
        this.routeSubscription = this.activatedRoute.params.subscribe(params => {
            this.ebookFileId = params['id'];
            this.fetchEbookFile();
        });

        this.breakpointObserver.observe('(max-width: 768px)').subscribe(result => {
            this.isSmallScreen = result.matches;
        });
    }

    ngOnDestroy() {
        this.routeSubscription?.unsubscribe();
    }

    async fetchIsOwner() {
        this.isUserAuthenticated = await this.authService.isUserAuthenticated();

        const userId = await this.authService.getUserId();
        this.isUserOwner = this.isUserAuthenticated && this.ebookFile?.ownerUserId === userId;

        if (this.isUserOwner) {
            this.chosenFormat = EbookFormat.HTML;
        } else if (ebookHasFormat(this.ebookFile, EbookFormat.PDF)) {
            this.chosenFormat = EbookFormat.PDF;
        } else if (ebookHasFormat(this.ebookFile, EbookFormat.HTML)) {
            this.chosenFormat = EbookFormat.HTML;
        } else {
            this.chosenFormat = null;
        }
    }

    fetchEbookFile() {
        this.ebookFileLoadingStatus = LoadingStatus.LOADING
        this.ebookFileService.getEbookFile(this.ebookFileId).subscribe({
            next: (ebookFile: EbookFile) => {
                this.ebookFile = ebookFile;
                this.ebookFileLoadingStatus = LoadingStatus.LOADED;
                this.fetchIsOwner().then();
            },
            error: (err: any) => {
                this.ebookFile = null;
                this.ebookFileLoadingStatus = LoadingStatus.ERROR;

                if (err.hasOwnProperty('status') && err.status === 404) {
                    this.ebookFileLoadingError = "not-found";
                } else if (err.hasOwnProperty('status') && [403, 401].includes(err.status)) {
                    this.ebookFileLoadingError = "unauthorized";
                } else {
                    this.ebookFileLoadingError = null;
                }
            }
        });
    }

    showSmallScreenModal() {
        const dialogRef = this.matDialog.open(EbookReaderSmModalComponent, {
            data: {
                ebookFile: this.ebookFile!,
                isUserOwner: this.isUserOwner!,
                isUserAuthenticated: this.isUserAuthenticated!,
                chosenFormat: this.chosenFormat,
                onFormatChanged: (chosenFormat: EbookFormat | null) => {
                    this.chosenFormat = chosenFormat;
                    dialogRef.close();
                }
            },
            autoFocus: false
        });
    }

    protected readonly LoadingStatus = LoadingStatus;
    protected readonly EbookFormat = EbookFormat;
    protected readonly ebookHasFormat = ebookHasFormat;
}

export function ebookHasFormat(ebookFile: EbookFile | null, format: EbookFormat) {
    if (!ebookFile || !ebookFile.downloadableFiles) {
        return false;
    }

    return ebookFile.downloadableFiles
        .some(file => file.format.toLowerCase() === format.toLowerCase());
}
