import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from "../services/authentication.service";
import {inject} from "@angular/core";

const authenticatedGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService: AuthenticationService = inject(AuthenticationService);
    const router: Router = inject(Router);

    return authService.isUserAuthenticated();
};

export default authenticatedGuard;
