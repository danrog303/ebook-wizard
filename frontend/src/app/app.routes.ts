import { Routes } from '@angular/router';
import { LandingPageContentComponent } from "./components/pages/landing-page/landing-page-content/landing-page-content.component";
import { LoginPageComponent } from "./components/pages/login-page/login-page.component";
import { RegistrationPageContentComponent } from "./components/pages/registration-page/registration-page-content/registration-page-content.component";
import {NotFoundPageComponent} from "./components/pages/not-found-page/not-found-page.component";
import unauthenticatedGuard from "./guards/unauthenticated.guard";
import logoutGuard from "./guards/logout.guard";
import {ResetPasswordPageContentComponent} from "./components/pages/reset-password-page/reset-password-page-content/reset-password-page-content.component";

export const routes: Routes = [
    {
        path: '',
        component: LandingPageContentComponent
    },
    {
        path: 'auth/login',
        component: LoginPageComponent,
        canActivate: [unauthenticatedGuard]
    },
    {
        path: 'auth/register',
        component: RegistrationPageContentComponent,
        canActivate: [unauthenticatedGuard]
    },
    {
        path: 'auth/logout',
        component: NotFoundPageComponent,
        canActivate: [logoutGuard]
    },
    {
        path: 'auth/reset-password',
        component: ResetPasswordPageContentComponent,
        canActivate: [unauthenticatedGuard]
    },
    {
        path: 'error/not-found',
        component: NotFoundPageComponent
    },
    {
        path: '**',
        redirectTo: 'error/not-found'
    }
];
