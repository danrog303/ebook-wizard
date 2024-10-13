import {Injectable} from "@angular/core";
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from "@angular/common/http";
import EbookProject from "../models/ebook-project/ebook-project.model";
import {filter, map, Observable} from "rxjs";
import environment from "../../environments/environment";
import UploadProgressEvent from "@app/models/misc/upload-progress-event.model";
import EbookFile from "@app/models/ebook-file/ebook-file.model";
import EbookFormat from "@app/models/ebook/ebook-format.enum";
import QueueTask from "@app/models/task-queue/queue-task.model";
import QueueTaskPayload from "@app/models/task-queue/queue-task-payload.model";

@Injectable({providedIn: 'root'})
export default class EbookProjectService {
    readonly MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
    readonly MAX_ILLUSTRATION_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    readonly MAX_COVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    constructor(private http: HttpClient) {}

    createEmptyEbookProject(ebookProject: EbookProject): Observable<EbookProject> {
        const url = `${environment.API_BASE_URI}/ebook-project`;
        return this.http.post<EbookProject>(url, ebookProject);
    }

    updateCoverImage(ebookProjectId: string, file: File): Observable<UploadProgressEvent<EbookProject>> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/cover-image`;
        const formData = new FormData();
        formData.append('file', file);

        const req = new HttpRequest('PUT', url, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return <Observable<UploadProgressEvent<EbookProject>>> this.http.request(req).pipe(
            map((event: HttpEvent<any>) => this.getEventMessage(event)),
            filter(msg => msg !== null),
        );
    }

    deleteCoverImage(ebookProjectId: string) {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/cover-image`;
        return this.http.delete<void>(url);
    }

    convertToEbookFile(ebookProjectId: string, targetFormat: EbookFormat): Observable<QueueTask<QueueTaskPayload>> {
        const url = `${environment.API_BASE_URI}/ebook-project/convert/${ebookProjectId}/to-file/${targetFormat}`;
        return this.http.post<QueueTask<QueueTaskPayload>>(url, null);
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

    getUrlToDisplayCoverImage(s: string) {
        const url = `${environment.API_BASE_URI}/ebook-project/${s}/cover-image`;
        return this.http.get(url, { responseType: 'text' });
    }

    sendToReader(ebookProjectId: string, ebookFormat: string, email: string): Observable<QueueTask<QueueTaskPayload>> {
        const url = `${environment.API_BASE_URI}/ebook-project/${ebookProjectId}/send/${ebookFormat}`;
        return this.http.post<QueueTask<QueueTaskPayload>>(url, email);
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
