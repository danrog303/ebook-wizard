import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {inject} from "@angular/core";
import AuthenticationService from "@app/services/authentication.service";

const authenticatedGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService: AuthenticationService = inject(AuthenticationService);
    const router: Router = inject(Router);

    const isUserAuthenticated = await authService.isUserAuthenticated();
    if (!isUserAuthenticated) {
        await router.navigate(['/auth/login']);
    }

    return isUserAuthenticated;
};

export default authenticatedGuard;
