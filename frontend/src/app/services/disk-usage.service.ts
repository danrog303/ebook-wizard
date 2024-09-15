import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, tap} from "rxjs";
import environment from "@env/environment";

@Injectable({providedIn: "root"})
export default class DiskUsageService {
    private limitCacheKey = "diskUsageLimit";

    constructor(private httpService: HttpClient) {
    }

    getDiskUsageBytes(): Observable<number> {
        const url = environment.API_BASE_URI + "/ebook/disk/usage";
        return this.httpService.get<number>(url);
    }

    getDiskLimitBytes(forceCacheInvalidation: boolean = false): Observable<number> {
        if (forceCacheInvalidation) {
            this.invalidateDiskLimitCache();
        }

        const cachedLimit = localStorage.getItem(this.limitCacheKey);
        if (cachedLimit) {
            return new Observable<number>(subscriber => {
                subscriber.next(parseInt(cachedLimit));
                subscriber.complete();
            });
        }

        // Make a query and cache the result in local storage
        const url = environment.API_BASE_URI + "/ebook/disk/limit";
        return this.httpService.get<number>(url).pipe(
            tap((limit: number) => {
                localStorage.setItem("diskUsageLimit", limit.toString());
            })
        );
    }

    invalidateDiskLimitCache() {
        localStorage.removeItem(this.limitCacheKey);
    }
}
