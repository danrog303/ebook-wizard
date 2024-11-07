import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import environment from "@env/environment";

@Injectable({
    providedIn: 'root'
})
export class AudiobookService {
    constructor(private http: HttpClient) {}

    /**
     * Synthesizes speech from text using the specified voice.
     * Returns an Observable of type Blob, which contains audio data.
     */
    synthesizeSpeech(voiceName: string, text: string): Observable<Blob> {
        const params = new HttpParams()
            .set('voiceName', voiceName)
            .set('text', text);

        const endpoint = `${environment.API_BASE_URI}/audiobook/synthesize`;

        return this.http.get(endpoint, {
            params,
            headers: new HttpHeaders({ 'Content-Type': 'audio/ogg' }),
            responseType: 'blob'
        });
    }

    /**
     * Retrieves a list of supported language codes.
     */
    getSupportedLanguages(): Observable<string[]> {
        const endpoint = `${environment.API_BASE_URI}/audiobook/languages`;
        return this.http.get<string[]>(endpoint);
    }

    /**
     * Retrieves a list of voice names for a specified language code.
     */
    getVoicesForLanguage(languageCode: string): Observable<string[]> {
        const endpoint = `${environment.API_BASE_URI}/audiobook/languages/${languageCode}/voices`;
        return this.http.get<string[]>(endpoint);
    }

    mapLanguageCodeToName(languageCode: string): string {
        const languageMap = {
            "fr-BE": "Français (Belgique)",
            "en-US": "English (United States)",
            "tr-TR": "Türkçe",
            "cs-CZ": "Čeština",
            "de-CH": "Deutsch (Schweiz)",
            "sv-SE": "Svenska",
            "ru-RU": "Русский",
            "ro-RO": "Română",
            "pt-PT": "Português (Portugal)",
            "pt-BR": "Português (Brasil)",
            "pl-PL": "Polski",
            "nl-BE": "Nederlands (België)",
            "nl-NL": "Nederlands",
            "nb-NO": "Norsk Bokmål",
            "ko-KR": "한국어",
            "ja-JP": "日本語",
            "it-IT": "Italiano",
            "is-IS": "Íslenska",
            "fr-FR": "Français",
            "fr-CA": "Français (Canada)",
            "es-US": "Español (Estados Unidos)",
            "es-MX": "Español (México)",
            "es-ES": "Español",
            "en-GB-WLS": "English (Wales)",
            "en-NZ": "English (New Zealand)",
            "en-ZA": "English (South Africa)",
            "en-IN": "English (India)",
            "en-GB": "English (United Kingdom)",
            "en-AU": "English (Australia)",
            "de-DE": "Deutsch",
            "da-DK": "Dansk",
            "cy-GB": "Cymraeg",
            "cmn-CN": "普通话 (中国大陆)", // Mandarin (China Mainland)
            "arb": "العربية",
            "ar-AE": "العربية (الإمارات)",
            "ca-ES": "Català",
            "de-AT": "Deutsch (Österreich)",
            "yue-CN": "粵語 (中國)", // Cantonese (China)
            "fi-FI": "Suomi",
            "en-IE": "English (Ireland)"
        } as any;
        return languageMap[languageCode] || $localize`Unknown language`;
    }
}
