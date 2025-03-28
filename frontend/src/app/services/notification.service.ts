import {MatSnackBar} from "@angular/material/snack-bar";
import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export default class NotificationService {
    public constructor(private readonly snackBar: MatSnackBar) {}

    public show(message: string) {
        this.snackBar.open(message, $localize`Dismiss`, {duration: 5000});
    }

    public showWithDuration(message: string, duration: number) {
        this.snackBar.open(message, $localize`Dismiss`, {duration: duration});
    }
}
