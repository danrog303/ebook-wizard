import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {MatSlideToggle, MatSlideToggleChange} from "@angular/material/slide-toggle";
import BookmarkService from "@app/services/bookmark.service";
import EbookFileBookmark from "@app/models/bookmark/bookmark.model";
import {firstValueFrom} from "rxjs";
import NotificationService from "@app/services/notification.service";
import {MatIcon} from "@angular/material/icon";
import LoadingStatus from "@app/models/misc/loading-status.enum";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";

export interface BookmarkMenuContext {
    changePage: (pageNumber: number) => Promise<void>;
    getCurrentPage: () => number;
}

@Component({
    selector: 'app-bookmark-menu',
    standalone: true,
    imports: [MatSlideToggle, MatIcon, FormsModule, MatButton, RouterLink],
    templateUrl: './bookmark-menu.component.html',
    styleUrl: './bookmark-menu.component.scss'
})
export class BookmarkMenuComponent implements OnInit, OnChanges {
    @Input() currentPageNumber: number = 1;
    @Input() ebookFileId: string = "";
    @Input() context: BookmarkMenuContext | null = null;

    bookmarks: EbookFileBookmark | null = null;
    bookmarkSliderChecked: boolean = false;
    operationProgress: LoadingStatus = LoadingStatus.NOT_STARTED;
    bookmarkServiceAvailable = false;

    constructor(private readonly bookmarkService: BookmarkService,
                private readonly notificationService: NotificationService) {
    }

    async ngOnInit() {
        try {
            this.bookmarkServiceAvailable = true;
            this.bookmarks = await firstValueFrom(this.bookmarkService.getBookmarksForEbookFile(this.ebookFileId));
            this.bookmarks.bookmarkedPages.sort((a, b) => a - b);
            if (this.bookmarks.bookmarkedPages.includes(this.currentPageNumber)) {
                this.bookmarkSliderChecked = true;
            }
        } catch(err) {
            if (JSON.stringify(err).includes("403") || JSON.stringify(err).includes("401")) {
                this.bookmarkServiceAvailable = false;
            } else {
                this.notificationService.show($localize`Failed to load bookmarks. Please try again later.`);
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['currentPageNumber'] && this.bookmarks) {
            this.bookmarkSliderChecked = this.bookmarks.bookmarkedPages.includes(this.currentPageNumber);
        }
    }

    async onBookmarkUpdated(event: MatSlideToggleChange) {
        this.operationProgress = LoadingStatus.LOADING;

        if (event.checked) {
            this.bookmarks!.bookmarkedPages.push(this.currentPageNumber);
            this.bookmarks!.bookmarkedPages.sort((a, b) => a - b);
        } else {
            this.bookmarks!.bookmarkedPages = this.bookmarks!.bookmarkedPages.filter(page => page !== this.currentPageNumber);
        }

        try {
            const updateObservable = this.bookmarkService.updateBookmarksForEbookFile(this.ebookFileId, this.bookmarks?.bookmarkedPages!);
            await firstValueFrom(updateObservable);
            this.operationProgress = LoadingStatus.LOADED;
        } catch {
            this.notificationService.show($localize`Failed to update bookmarks. Please try again later.`);
            this.operationProgress = LoadingStatus.ERROR;
        }
    }

    onBookmarkSelected(bookmarkedPage: number) {
        this.context?.changePage(bookmarkedPage);
    }

    protected readonly LoadingStatus = LoadingStatus;
}
