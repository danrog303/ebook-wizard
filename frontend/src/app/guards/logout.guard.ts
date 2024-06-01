import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from "../services/authentication.service";
import {inject} from "@angular/core";
import {MatSnackBar} from "@angular/material/snack-bar";

const logoutGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService: AuthenticationService = inject(AuthenticationService);
    const routerService: Router = inject(Router);
    const snackBarService: MatSnackBar = inject(MatSnackBar);
    await authService.signOut();
    await routerService.navigate(['/']);
    snackBarService.open('You have been logged out.', 'Ok', {duration: 5000});
    return true;
};

export default logoutGuard;
