import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestDesignerComponent } from './test-designer/test-designer.component';
import { SprintsComponent } from './sprints/sprints.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BulkDesignerComponent } from './bulk-designer/bulk-designer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmComponent } from './shared/components/confirm/confirm.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    TestDesignerComponent,
    SprintsComponent,
    DashboardComponent,
    BulkDesignerComponent
    ,ToastComponent
    ,ConfirmComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
