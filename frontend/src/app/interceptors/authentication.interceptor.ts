import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import {AuthenticationService} from "../services/authentication.service";
import environment from "../../environments/environment";

export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthenticationService);
    const token = authService.getAccessJwtToken();

    if (req.url.startsWith(environment.API_BASE_URI) && token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(authReq);
    }

    return next(req);
};
