import { Routes } from '@angular/router';
import { LandingPageContentComponent } from "./components/pages/landing-page/content/landing-page-content.component";
import unauthenticatedGuard from "./guards/unauthenticated.guard";
import logoutGuard from "./guards/logout.guard";
import authenticatedGuard from "./guards/authenticated.guard";

export const routes: Routes = [
    {
        path: '',
        component: LandingPageContentComponent
    },
    {
        path: 'auth/login',
        canActivate: [unauthenticatedGuard],
        loadComponent: () => import('./components/pages/login-page/login-page.component').then(m => m.LoginPageComponent),
    },
    {
        path: 'auth/register',
        canActivate: [unauthenticatedGuard],
        loadComponent: () => import('./components/pages/registration-page/content/registration-page-content.component').then(m => m.RegistrationPageContentComponent),
    },
    {
        path: 'auth/logout',
        canActivate: [logoutGuard],
        loadComponent: () => import('./components/pages/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent),
    },
    {
        path: 'auth/reset-password',
        canActivate: [unauthenticatedGuard],
        loadComponent: () => import('./components/pages/reset-password-page/content/reset-password-page-content.component').then(m => m.ResetPasswordPageContentComponent),
    },
    {
        path: 'ebook',
        canActivate: [authenticatedGuard],
        loadComponent: () => import('./components/pages/ebook-page/content/ebook-page-content.component').then(m => m.EbookPageContent),
    },
    {
        path: 'ebook/last-modified',
        canActivate: [authenticatedGuard],
        loadComponent: () => import('./components/pages/ebook-page/content/ebook-page-content.component').then(m => m.EbookPageContent),
    },
    {
        path: 'ebook-project',
        canActivate: [authenticatedGuard],
        loadComponent: () => import('./components/pages/ebook-page/content/ebook-page-content.component').then(m => m.EbookPageContent),
    },
    {
        path: 'ebook-file',
        canActivate: [authenticatedGuard],
        loadComponent: () => import('./components/pages/ebook-page/content/ebook-page-content.component').then(m => m.EbookPageContent),
    },
    {
        path: 'account-manager',
        canActivate: [authenticatedGuard],
        loadComponent: () => import('./components/pages/ebook-page/content/ebook-page-content.component').then(m => m.EbookPageContent),
    },
    {
        path: 'reader/ebook-file/:id',
        loadComponent: () => import('./components/pages/ebook-reader-page/content/ebook-reader-page.component').then(m => m.EbookReaderPageComponent),
    },
    {
        path: 'editor/ebook-project/:id',
        canActivate: [authenticatedGuard],
        loadComponent: () => import('./components/pages/ebook-project-editor-page/content/ebook-project-editor-page.component').then(m => m.EbookProjectEditorPageComponent),
    },
    {
        path: 'reader/ebook-project/:id',
        loadComponent: () => import('./components/pages/ebook-project-reader-page/content/ebook-project-reader-page.component').then(m => m.EbookProjectReaderPageComponent),
    },
    {
        path: 'about',
        loadComponent: () => import('./components/pages/about-page/content/about-page.component').then(m => m.AboutPageComponent),
    },
    {
        path: 'error/not-found',
        loadComponent: () => import('./components/pages/not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent),
    },
    {
        path: '**',
        redirectTo: 'error/not-found',
    }
];
