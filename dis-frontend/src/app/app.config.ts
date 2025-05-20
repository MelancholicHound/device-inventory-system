import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
        providePrimeNG({
            theme: { preset: Aura, options: { darkModeSelector: false || 'none' } }
        })
    ]
};
