import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export default class GravatarService {
    async getGravatarUrl(email: string): Promise<string> {
        const emailCleaned = email.trim().toLowerCase();
        return `https://www.gravatar.com/avatar/${await this.sha256(emailCleaned)}`;
    }

    async getGravatarChangeUrl(email: string): Promise<string> {
        const emailCleaned = email.trim().toLowerCase();
        const emailHash = await this.sha256(emailCleaned);
        const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=404`;

        const response = await fetch(gravatarUrl, { method: 'HEAD' });
        if (response.status === 404) {
            return `https://www.gravatar.com/site/signup`;
        } else {
            return `https://www.gravatar.com/${emailHash}`;
        }
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
