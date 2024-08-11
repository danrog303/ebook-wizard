import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from '@angular/router';
import {inject} from "@angular/core";
import {map} from "rxjs";
import AuthenticationService from "@app/services/authentication.service";

const unauthenticatedGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService: AuthenticationService = inject(AuthenticationService);

    return authService.$isUserAuthenticated
            .pipe(map(isAuthenticated => !isAuthenticated));
};

export default unauthenticatedGuard;
