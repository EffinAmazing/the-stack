import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './pages/signup/signup.component';
import { SigninComponent } from './pages/signin/signin.component';
import { AccountComponent } from './pages/account/account.component';
import { UsersManagmentComponent } from './pages/users-managment/users-managment.component';
import { ToolsManagmentComponent } from './pages/tools-managment/tools-managment.component';
import { ResetPasswordSendComponent } from './pages/reset-password-send/reset-password-send.component';
import { ResetPasswordFormComponent } from './pages/reset-password-form/reset-password-form.component';
import { AuthGuardGuard as AuthGuard } from '../../core/guards/auth-guard.guard';

const routes: Routes = [
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'verify/:code',
    component: SignupComponent
  },
  {
    path: 'users',
    component: UsersManagmentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'tools',
    component: ToolsManagmentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'forgot-password',
    component: ResetPasswordSendComponent,
  },
  {
    path: 'reset-password/:code',
    component: ResetPasswordFormComponent
  },
  {
    path: '',
    component: AccountComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
