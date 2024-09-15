import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from '@angular/core';
import {from, switchMap} from "rxjs";
import AuthenticationService from "@app/services/authentication.service";
import environment from "@env/environment";

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthenticationService);

    return from(authService.getAccessJwtToken()).pipe(
        switchMap(token => {
            const stringToken = String(token).trim();
            const hasToken = stringToken && stringToken !== 'null' && stringToken !== 'undefined';

            if (req.url.startsWith(environment.API_BASE_URI) && hasToken) {
                const authReq = req.clone({
                    setHeaders: {

                        Authorization: `Bearer ${stringToken}`
                    }
                });
                return next(authReq);
            }

            return next(req);
        })
    );
}
