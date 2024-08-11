import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from '@angular/core';
import {from, switchMap} from "rxjs";
import AuthenticationService from "@app/services/authentication.service";
import environment from "@env/environment";

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthenticationService);

    return from(authService.getAccessJwtToken()).pipe(
        switchMap(token => {
            if (req.url.startsWith(environment.API_BASE_URI) && token) {
                const authReq = req.clone({
                    setHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                });
                return next(authReq);
            }

            return next(req);
        })
    );
};
