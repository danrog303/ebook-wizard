import {Injectable} from "@angular/core";
import EbookProjectChapter from "../models/ebook-project/ebook-project-chapter.model";
import {Observable} from "rxjs";
import environment from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({providedIn: 'root'})
export default class EbookProjectChapterService {
    constructor(private http: HttpClient) {}

    createChapter(ebookProjectId: string, chapter: EbookProjectChapter): Observable<EbookProjectChapter> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/chapter`;
        return this.http.post<EbookProjectChapter>(url, chapter);
    }

    deleteChapter(ebookProjectId: string, chapterId: string): Observable<void> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/chapter/${chapterId}`;
        return this.http.delete<void>(url);
    }

    updateChapter(ebookProjectId: string, chapterId: string, chapter: EbookProjectChapter): Observable<EbookProjectChapter> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/chapter/${chapterId}`;
        return this.http.put<EbookProjectChapter>(url, chapter);
    }
}
