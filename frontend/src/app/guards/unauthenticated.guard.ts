import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {inject} from "@angular/core";
import AuthenticationService from "@app/services/authentication.service";

const unauthenticatedGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const router = inject(Router);
    const authService = inject(AuthenticationService);

    return new Promise<boolean>((resolve, reject) => {
        let currentAttempt = 0;
        const maxAttempts = 200;

        const interval = setInterval(async () => {
            const windowIsDefined = typeof window !== 'undefined';
            const isAuthenticated = await authService.isUserAuthenticated();

            if (windowIsDefined) {
                clearInterval(interval);
                if (isAuthenticated) {
                    await router.navigate(['/']);
                }

                resolve(!isAuthenticated);
            } else if (currentAttempt++ >= maxAttempts) {
                clearInterval(interval);
                reject(new Error("Window is not defined"));
            }
        }, 10);
    });
};

export default unauthenticatedGuard;
