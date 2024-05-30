import { Routes } from '@angular/router';
import { LandingPageContentComponent } from "./components/pages/landing-page/landing-page-content/landing-page-content.component";
import { LoginPageComponent } from "./components/pages/login-page/login-page.component";
import { RegistrationPageComponent } from "./components/pages/registration-page/registration-page.component";

export const routes: Routes = [
    {
        path: '',
        component: LandingPageContentComponent
    },
    {
        path: 'auth/login',
        component: LoginPageComponent
    },
    {
        path: 'auth/register',
        component: RegistrationPageComponent
    }
];
