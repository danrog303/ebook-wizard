import { Routes } from '@angular/router';
import { LandingPageContentComponent } from "./components/pages/landing-page/landing-page-content/landing-page-content.component";

export const routes: Routes = [
    {
        path: '**',
        component: LandingPageContentComponent,

    },
];
