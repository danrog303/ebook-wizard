import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import environment from "@env/environment";
import {Observable} from "rxjs";
import EbookWizardStatistics from "@app/models/ebook/ebook-wizard-statistics.model";

@Injectable({providedIn: 'root'})
export default class EbookWizardStatisticsService {
    constructor(private httpClient: HttpClient) {
    }

    getStatistics(): Observable<EbookWizardStatistics> {
        const url = environment.API_BASE_URI + '/statistics';
        return this.httpClient.get<EbookWizardStatistics>(url);
    }
}
