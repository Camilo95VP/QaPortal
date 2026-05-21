import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestDesignerComponent } from './test-designer/test-designer.component';
import { RepoFilesComponent } from './repo-files/repo-files.component';
import { SprintsComponent } from './sprints/sprints.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BulkDesignerComponent } from './bulk-designer/bulk-designer.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'test-designer', component: TestDesignerComponent },
  { path: 'bulk-designer', component: BulkDesignerComponent },
  { path: 'repo-files', component: RepoFilesComponent },
  { path: 'sprints', component: SprintsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
