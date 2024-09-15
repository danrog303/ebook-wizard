import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export default class GravatarService {
    async getGravatarUrl(email: string): Promise<string> {
        const emailCleaned = email.trim().toLowerCase();
        return `https://www.gravatar.com/avatar/${await this.sha256(emailCleaned)}`;
    }

    private async sha256(string: string) {
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray
            .map((bytes) => bytes.toString(16).padStart(2, '0'))
            .join('');
    }
}
