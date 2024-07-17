import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import QueueTaskSseReport from "../models/task-queue/queue-task-sse-report.model";

@Injectable({providedIn: 'root'})
export class TaskTrackingService {

    constructor(private ngZone: NgZone) { }

    getTaskStatus(taskId: string): Observable<QueueTaskSseReport> {
        return new Observable<any>(observer => {
            const eventSource = new EventSource(`/queue/task/tracking/${taskId}`);

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
