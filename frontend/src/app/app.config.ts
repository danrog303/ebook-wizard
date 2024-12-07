import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideClientHydration} from '@angular/platform-browser';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideNativeDateAdapter} from "@angular/material/core";
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {authenticationInterceptor} from "./interceptors/authentication.interceptor";
import {provideQuillConfig, QuillModule} from "ngx-quill";
import QuillIllustrationService from "@app/services/quill-illustration.service";

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideClientHydration(),
        provideAnimationsAsync(),
        provideNativeDateAdapter(),

        provideHttpClient(
            withInterceptors([
                authenticationInterceptor
            ])
        ),

        importProvidersFrom(
            QuillModule.forRoot()
        ),

        provideQuillConfig({
            modules: {
                toolbar: {
                    container: [
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],   // Listy numerowane i punktowane
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'font': [] }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        ['image'],
                        [{ 'align': [] }],
                        [{ 'header': [1, 2, 3, 4, false] }],
                        ['clean']
                    ],
                    handlers: {
                        image: () => {
                            const illustrationService = new QuillIllustrationService();
                            illustrationService.handleQuillImageUpload()
                        }
                    }
                },
                syntax: false,
                blotFormatter: {},
            },
        })
    ]
};
