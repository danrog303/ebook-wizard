import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import EbookFileBookmark from "@app/models/bookmark/bookmark.model";
import environment from "@env/environment";

@Injectable({providedIn: "root"})
export default class BookmarkService {

    constructor(private readonly http: HttpClient) {}

    /**
     * Get bookmarks for a specific ebook file by ID
     * @param ebookFileId ID of the ebook file
     */
    getBookmarksForEbookFile(ebookFileId: string): Observable<EbookFileBookmark> {
        const endpoint = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}/bookmarks`;
        console.log(endpoint);
        return this.http.get<EbookFileBookmark>(endpoint);
    }

    /**
     * Update the bookmarked pages for a specific ebook file
     * @param ebookFileId ID of the ebook file
     * @param bookmarkedPages List of bookmarked pages
     */
    updateBookmarksForEbookFile(ebookFileId: string, bookmarkedPages: number[]): Observable<EbookFileBookmark> {
        const endpoint = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}/bookmarks`;
        return this.http.put<EbookFileBookmark>(endpoint, bookmarkedPages);
    }
}
