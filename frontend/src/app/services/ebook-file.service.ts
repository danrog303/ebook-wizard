import {Injectable} from "@angular/core";
import environment from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import EbookFile from "../models/ebook-file/ebook-file.model";
import QueueTask from "../models/task-queue/queue-task.model";
import QueueTaskPayload from "../models/task-queue/queue-task-payload.model";

@Injectable({providedIn: 'root'})
export default class EbookFileService {
    constructor(private http: HttpClient) {}

    convertEbookToEbookFile(ebookFileId: string, targetFormat: string): Observable<QueueTask<QueueTaskPayload>> {
        const url = `${environment.API_BASE_URI}/ebook-file/convert/${ebookFileId}/to-file/${targetFormat}`;
        return this.http.post<QueueTask<QueueTaskPayload>>(url, null);
    }

    convertEbookFileToEbookProject(ebookFileId: string): Observable<QueueTask<QueueTaskPayload>> {
        const url = `${environment.API_BASE_URI}/ebook-file/convert/${ebookFileId}/to-project`;
        return this.http.post<QueueTask<QueueTaskPayload>>(url, null);
    }

    sendEbookFileToDevice(targetEmail: string, ebookFileId: string, targetFormat: string): Observable<QueueTask<QueueTaskPayload>> {
        const url = `${environment.API_BASE_URI}/ebook-file/send-to-device/${ebookFileId}/${targetFormat}`;
        return this.http.post<QueueTask<QueueTaskPayload>>(url, targetEmail, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        });
    }

    getEbookFile(ebookFileId: string): Observable<EbookFile> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}`;
        return this.http.get<EbookFile>(url);
    }

    listEbookFilesOfAuthenticatedUser(): Observable<EbookFile[]> {
        const url = `${environment.API_BASE_URI}/ebook-file`;
        return this.http.get<EbookFile[]>(url);
    }

    getUrlToDownloadFile(ebookFileId: string, ebookFileFormat: string): Observable<string> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}/${ebookFileFormat}`;
        return this.http.get(url, { responseType: 'text' });
    }

    deleteEbookFileFormat(ebookFileId: string, ebookFileFormat: string): Observable<void> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}/${ebookFileFormat}`;
        return this.http.delete<void>(url);
    }

    importEbookFromFile(file: File): Observable<EbookFile> {
        const url = `${environment.API_BASE_URI}/ebook-file`;
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<EbookFile>(url, formData);
    }

    updateEbookFileCoverImage(file: File, ebookFileId: string): Observable<EbookFile> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}/cover-image`;
        const formData = new FormData();
        formData.append('file', file);
        return this.http.put<EbookFile>(url, formData);
    }

    deleteEbookFile(ebookFileId: string): Observable<void> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}`;
        return this.http.delete<void>(url);
    }

    updateEbookFile(ebookFileId: string, ebook: EbookFile): Observable<EbookFile> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}`;
        return this.http.put<EbookFile>(url, ebook);
    }
}
