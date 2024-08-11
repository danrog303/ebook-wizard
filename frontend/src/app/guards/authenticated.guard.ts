import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {inject} from "@angular/core";
import AuthenticationService from "@app/services/authentication.service";

const authenticatedGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService: AuthenticationService = inject(AuthenticationService);
    const router: Router = inject(Router);

    return authService.isUserAuthenticated();
};

export default authenticatedGuard;
