import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './core/middleware/auth.interceptor';
import { errorInterceptor } from './core/middleware/auth.errorInterceptor ';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { firebaseEnvironment, GoogleKey } from '../environments/environment';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthServiceConfig } from '@abacritt/angularx-social-login';
import { Loader } from '@googlemaps/js-api-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideToastr({
      timeOut: 4000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    provideAngularSvgIcon(),
    provideHttpClient(withInterceptors([AuthInterceptor, errorInterceptor])),
    importProvidersFrom(AngularFireModule.initializeApp(firebaseEnvironment.firebase)),
    provideAuth(() => getAuth()),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        lang: 'en',
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '474079373247-gj4fsiu4bm53csn7sb3ki0u81ruomra2.apps.googleusercontent.com'
            )
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('1412425750378272')
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    },
    {
      provide: Loader,
      useValue: new Loader({
        apiKey: GoogleKey,
        libraries: ['places']
      })
    }
  ]
};
