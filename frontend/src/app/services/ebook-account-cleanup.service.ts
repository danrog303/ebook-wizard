import { Injectable } from "@angular/core";
import {HttpClient} from "@angular/common/http";
import environment from "@env/environment.development";
import {firstValueFrom} from "rxjs";

@Injectable({providedIn: 'root'})
export default class EbookAccountCleanupService {
    constructor(private httpClient: HttpClient) {
    }

    public async cleanupAccount() {
        const url = environment.API_BASE_URI + "/account/cleanup";
        return await firstValueFrom(this.httpClient.delete(url));
    }
}
