import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {inject} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import AuthenticationService from "@app/services/authentication.service";

const logoutGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService: AuthenticationService = inject(AuthenticationService);
    const routerService: Router = inject(Router);
    const snackBarService: MatSnackBar = inject(MatSnackBar);
    await authService.signOut();
    await routerService.navigate(['/']);
    snackBarService.open($localize`You have been logged out.`, $localize`Ok`, {duration: 5000});
    return true;
};

export default logoutGuard;
