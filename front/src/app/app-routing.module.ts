import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeModule } from './modules/home/home.module';


const routes: Routes = [
  { 
    path: "home", 
    loadChildren: async () => { 
      const { HomeModule } =  await import('./modules/home/home.module');
      return HomeModule;
    },
  },
  {
    path: "blueprints",
    loadChildren: async () => {
      const { BlueprintModule } = await import('./modules/blueprint/blueprint.module');
      return BlueprintModule;
    }
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
