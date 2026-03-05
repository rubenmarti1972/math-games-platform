import { ApplicationConfig }  from '@angular/core';
import { importProvidersFrom } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app.routing.module';


export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(AppRoutingModule),
    provideClientHydration()
  ]
};
