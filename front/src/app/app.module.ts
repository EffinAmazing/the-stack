import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BlueprintModule } from './modules/blueprint/blueprint.module';
import { HomeModule } from './modules/home/home.module';
import { NoCacheHeadersInterceptor } from './core/interceptors/no-cache-headers.interceptor';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ProfileModule } from './modules/profile/profile.module';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BlueprintModule,
    HomeModule,
    ProfileModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoCacheHeadersInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(private router: Router) {
    this.router.events.pipe(
      filter( (e) => e instanceof NavigationStart)
    ).subscribe(e => {
      // console.log(e, window.location.search);
      if (window['analytics']) {
        window['analytics'].page();
      }
    });
  }
}
