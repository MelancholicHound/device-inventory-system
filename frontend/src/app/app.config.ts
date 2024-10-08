import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ReuseStrategy } from './util/reuse-strategy';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RouteReuseStrategy } from '@angular/router';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
        provideAnimationsAsync(),
        provideHttpClient(withInterceptorsFromDi()),
        { provide: RouteReuseStrategy, useClass: ReuseStrategy }
    ]
};
