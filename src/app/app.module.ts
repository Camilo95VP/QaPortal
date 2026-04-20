import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestDesignerComponent } from './test-designer/test-designer.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TestDesignerComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
