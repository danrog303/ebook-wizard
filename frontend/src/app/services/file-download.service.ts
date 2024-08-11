import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export default class FileDownloadService {
    downloadFile(url: string, filename: string): void {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    }
}
