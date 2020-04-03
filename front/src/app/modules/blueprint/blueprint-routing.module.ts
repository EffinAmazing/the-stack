import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuildStackComponent } from './pages/build-stack/build-stack.component';
import { ShareComponent } from './pages/share/share.component';


const routes: Routes = [
  {
    path: 'build',
    component: BuildStackComponent
  },
  {
    path: 'share',
    component: ShareComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlueprintRoutingModule { }
