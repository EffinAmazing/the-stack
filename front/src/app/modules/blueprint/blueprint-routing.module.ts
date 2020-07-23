import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuildStackComponent } from './pages/build-stack/build-stack.component';
import { ShareComponent } from './pages/share/share.component';
import { AuthGuardGuard as AuthGuard } from '../../core/guards/auth-guard.guard';
import { ComponentCanDeactivateGuard } from '../../core/guards/component-can-deactivate.guard';


const routes: Routes = [
  {
    path: 'build',
    component: BuildStackComponent,
    canDeactivate: [ComponentCanDeactivateGuard]
  },
  {
    path: 'build/:id',
    component: BuildStackComponent,
    canActivate: [ AuthGuard ]
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
