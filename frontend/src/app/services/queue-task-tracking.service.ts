import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import QueueTaskSseReport from "../models/task-queue/queue-task-sse-report.model";
import environment from "../../environments/environment";

@Injectable({providedIn: 'root'})
export default class QueueTaskTrackingService {
    constructor(private readonly ngZone: NgZone) { }

    getTaskStatus(taskId: string): Observable<QueueTaskSseReport> {
        return new Observable<any>(observer => {
            const url = `${environment.API_BASE_URI}/queue/task/tracking/${taskId}`;
            const eventSource = new EventSource(url);

            eventSource.onmessage = (event) => {
                this.ngZone.run(() => {
                    observer.next(JSON.parse(event.data));
                });
            };

            eventSource.onerror = (error) => {
                this.ngZone.run(() => {
                    observer.error(error);
                    eventSource.close();
                });
            };

            return () => {
                eventSource.close();
            };
        });
    }
}
