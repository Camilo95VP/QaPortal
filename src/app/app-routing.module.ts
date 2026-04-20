import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestDesignerComponent } from './test-designer/test-designer.component';
import { RepoFilesComponent } from './repo-files/repo-files.component';

const routes: Routes = [
  { path: '', redirectTo: 'test-designer', pathMatch: 'full' },
  { path: 'test-designer', component: TestDesignerComponent },
  { path: 'repo-files', component: RepoFilesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
