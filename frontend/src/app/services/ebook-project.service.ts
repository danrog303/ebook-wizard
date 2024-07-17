import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import EbookProject from "../models/ebook-project/ebook-project.model";
import {Observable} from "rxjs";
import environment from "../../environments/environment";

@Injectable({providedIn: 'root'})
class EbookProjectService {
    constructor(private http: HttpClient) {}

    createEmptyEbookProject(ebookProject: EbookProject): Observable<EbookProject> {
        const url = `${environment.API_BASE_URI}/ebook-project`;
        return this.http.post<EbookProject>(url, ebookProject);
    }

    uploadIllustrationImage(ebookProjectId: string, file: File): Observable<EbookProject> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/illustration`;
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<EbookProject>(url, formData);
    }

    updateCoverImage(ebookProjectId: string, file: File): Observable<EbookProject> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/cover-image`;
        const formData = new FormData();
        formData.append('file', file);
        return this.http.put<EbookProject>(url, formData);
    }

    deleteIllustrationImage(ebookProjectId: string, illustrationHash: string): Observable<void> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/illustration/${illustrationHash}`;
        return this.http.delete<void>(url);
    }

    updateEbookProject(ebookProjectId: string, ebookProject: EbookProject): Observable<EbookProject> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}`;
        return this.http.put<EbookProject>(url, ebookProject);
    }

    deleteEbookProject(ebookProjectId: string): Observable<void> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}`;
        return this.http.delete<void>(url);
    }

    listEbookProjectsOfAuthenticatedUser(): Observable<EbookProject[]> {
        const url = `${environment.API_BASE_URI}/ebook-project`;
        return this.http.get<EbookProject[]>(url);
    }

    getEbookProject(ebookProjectId: string): Observable<EbookProject> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}`;
        return this.http.get<EbookProject>(url);
    }

    getEbookDownloadUrl(ebookProjectId: string, ebookDownloadableFileStub: string): Observable<string> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/${ebookDownloadableFileStub}`;
        return this.http.get(url, { responseType: 'text' });
    }

    addEbookFormat(ebookProjectId: string, ebookFileFormat: string): Observable<string> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/${ebookFileFormat}`;
        return this.http.post(url, null, { responseType: 'text' });
    }

    deleteEbookFormat(ebookProjectId: string, ebookDownloadableFileStub: string): Observable<void> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/${ebookDownloadableFileStub}`;
        return this.http.delete<void>(url);
    }
}
