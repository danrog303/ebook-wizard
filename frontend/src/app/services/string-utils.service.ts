import {Injectable} from "@angular/core";

@Injectable({
    providedIn: "root"
})
export default class StringUtilsService {
    formatBytes(bytes: number): string {
        const marker = 1024; // Change to 1000 if required
        const decimal = 0; // Change as required
        const kiloBytes = marker; // One Kilobyte is 1024 bytes
        const megaBytes = marker * marker; // One MB is 1024 KB
        const gigaBytes = marker * marker * marker; // One GB is 1024 MB

        if (bytes < kiloBytes) return bytes + " B";
        else if (bytes < megaBytes) return (bytes / kiloBytes).toFixed(decimal) + " KB";
        else if (bytes < gigaBytes) return (bytes / megaBytes).toFixed(decimal) + " MB";
        else return (bytes / gigaBytes).toFixed(decimal) + " GB";
    }
}
