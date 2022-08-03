import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CursorManagerDirective } from "./shared/directives/cursor-manager.directive"
import { TrackingDirective } from "./shared/directives/tracking.directive"

@NgModule({
  declarations: [AppComponent, CursorManagerDirective, TrackingDirective],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
