import {Injectable} from "@angular/core";
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from "@angular/common/http";
import {filter, map, Observable} from "rxjs";

import environment from "@env/environment";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import QueueTask from "@app/models/task-queue/queue-task.model";
import QueueTaskPayload from "@app/models/task-queue/queue-task-payload.model";
import UploadProgressEvent from "@app/models/misc/upload-progress-event.model";
import EbookFolder from "@app/models/ebook/ebook-folder.model";

@Injectable({providedIn: 'root'})
export default class EbookFileService {
    readonly MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
    readonly MAX_FILE_COVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    constructor(private readonly http: HttpClient) {}

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

    getUrlToDisplayCoverImage(ebookFileId: string): Observable<string> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}/cover-image`;
        return this.http.get(url, { responseType: 'text' });
    }

    getUrlToDownloadFile(ebookFileId: string, ebookFileFormat: string, contentDispositionType: string = "ATTACHMENT"): Observable<string> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}/${ebookFileFormat}?dispositionType=${contentDispositionType}`;
        return this.http.get(url, { responseType: 'text' });
    }

    deleteEbookFileFormat(ebookFileId: string, ebookFileFormat: string): Observable<void> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}/${ebookFileFormat}`;
        return this.http.delete<void>(url);
    }

    importEbookFromFile(file: File): Observable<UploadProgressEvent<EbookFile>> {
        const url = `${environment.API_BASE_URI}/ebook-file`;
        const formData = new FormData();
        formData.append('file', file);

        const req = new HttpRequest('POST', url, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return <Observable<UploadProgressEvent<EbookFile>>> this.http.request(req).pipe(
            map((event: HttpEvent<any>) => {
                switch (event.type) {
                    case HttpEventType.UploadProgress:
                        const progress = Math.round((event.loaded / event.total!) * 100);
                        return { progress: progress, result: null };
                    case HttpEventType.Response:
                        return { progress: 100, result: event.body };
                    default:
                        return null;
                }
            }),
            filter(msg => msg !== null)
        );
    }

    updateEbookFileCoverImage(file: File, ebookFileId: string): Observable<UploadProgressEvent<EbookFile>> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}/cover-image`;
        const formData = new FormData();
        formData.append('file', file);

        const req = new HttpRequest('PUT', url, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return <Observable<UploadProgressEvent<EbookFile>>> this.http.request(req).pipe(
            map((event: HttpEvent<any>) => this.getEventMessage(event)),
            filter(msg => msg !== null),
        );

    }

    deleteEbookFile(ebookFileId: string): Observable<void> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}`;
        return this.http.delete<void>(url);
    }

    updateEbookFile(ebookFileId: string, ebook: EbookFile): Observable<EbookFile> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}`;
        return this.http.put<EbookFile>(url, ebook);
    }

    deleteCoverImage(ebookFileId: string): Observable<void> {
        const url = `${environment.API_BASE_URI}/ebook-file/${ebookFileId}/cover-image`;
        return this.http.delete<void>(url);
    }

    getExistingFolders(): Observable<EbookFolder[]> {
        const url = `${environment.API_BASE_URI}/ebook-file/folders`;
        return this.http.get<EbookFolder[]>(url);
    }

    private getEventMessage<T>(event: HttpEvent<any>): UploadProgressEvent<T> | null {
        switch (event.type) {
            case HttpEventType.UploadProgress:
                return { progress: Math.round(100 * (event.loaded / (event.total || 1))), result: null };

            case HttpEventType.Response:
                return { progress: 100, result: event.body };

            default:
                return null;
        }
    }
}
