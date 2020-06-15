import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'home',
    loadChildren: async () => {
      const { HomeModule } =  await import('./modules/home/home.module');
      return HomeModule;
    },
  },
  {
    path: 'blueprints',
    redirectTo: 'stack',
    pathMatch: 'prefix'
  },
  {
    path: 'stack',
    loadChildren: async () => {
      const { BlueprintModule } = await import('./modules/blueprint/blueprint.module');
      return BlueprintModule;
    }
  },
  {
    path: 'profile',
    loadChildren: async () => {
      const { ProfileModule } = await import('./modules/profile/profile.module');
      return ProfileModule;
    }
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
  /*{
    path: '',
    loadChildren: async () => {
      const { HomeModule } =  await import('./modules/home/home.module');
      return HomeModule;
    },
  },*/
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    urlUpdateStrategy: 'eager',
    paramsInheritanceStrategy: 'always'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
