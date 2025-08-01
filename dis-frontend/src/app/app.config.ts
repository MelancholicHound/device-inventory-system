import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';

import { providePrimeNG } from 'primeng/config';
import { MessageService, ConfirmationService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideAnimationsAsync(),
    MessageService,
    ConfirmationService,
    provideHttpClient(withInterceptorsFromDi()),
    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: false || 'none' } }
    })
  ]
};
