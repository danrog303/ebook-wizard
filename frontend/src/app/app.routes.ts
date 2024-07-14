import { Routes } from '@angular/router';
import { LandingPageContentComponent } from "./components/pages/landing-page/landing-page-content/landing-page-content.component";
import { LoginPageComponent } from "./components/pages/login-page/login-page.component";
import { RegistrationPageContentComponent } from "./components/pages/registration-page/registration-page-content/registration-page-content.component";
import {NotFoundPageComponent} from "./components/pages/not-found-page/not-found-page.component";
import unauthenticatedGuard from "./guards/unauthenticated.guard";
import logoutGuard from "./guards/logout.guard";
import {ResetPasswordPageContentComponent} from "./components/pages/reset-password-page/reset-password-page-content/reset-password-page-content.component";
import {EbookPageContent} from "./components/pages/ebook-page/ebook-page-content/ebook-page-content.component";
import authenticatedGuard from "./guards/authenticated.guard";
import {AboutPageComponent} from "./components/pages/about-page/about-page.component";

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
        path: 'ebook',
        component: EbookPageContent,
        canActivate: [authenticatedGuard]
    },
    {
        path: 'ebook/last-modified',
        component: EbookPageContent,
        canActivate: [authenticatedGuard]
    },
    {
        path: 'ebook-project',
        component: EbookPageContent,
        canActivate: [authenticatedGuard]
    },
    {
        path: 'ebook-file',
        component: EbookPageContent,
        canActivate: [authenticatedGuard]
    },
    {
        path: 'about',
        component: AboutPageComponent
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
