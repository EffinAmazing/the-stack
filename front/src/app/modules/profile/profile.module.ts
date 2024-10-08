import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ButtonsIndicatorsModule } from '../../shared/modules/material/buttons-indicators/buttons-indicators.module';
import { FormsControlsModule } from '../../shared/modules/material/forms-controls/forms-controls.module';
import { LayoutModule } from '../../shared/modules/material/layout/layout.module';
import { PopupsModalsModule } from '../../shared/modules/material/popups-modals/popups-modals.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SignupComponent } from './pages/signup/signup.component';
import { SignupFormComponent } from './components/signup-form/signup-form.component';
import { SigninComponent } from './pages/signin/signin.component';
import { SigninFormComponent } from './components/signin-form/signin-form.component';
import { AccountComponent } from './pages/account/account.component';
import { SharedModule } from '../../shared/shared.module';
import { UsersManagmentComponent } from './pages/users-managment/users-managment.component';
import { ToolsManagmentComponent } from './pages/tools-managment/tools-managment.component';
import { ConfirmActionComponent } from './components/confirm-action/confirm-action.component';
import { UpdateUserFormComponent } from './components/update-user-form/update-user-form.component';
import { InvitedUsersComponent } from './components/invited-users/invited-users.component';
import { InviteToStackComponent } from './components/invite-to-stack/invite-to-stack.component';
import { ResetPasswordSendComponent } from './pages/reset-password-send/reset-password-send.component';
import { ResetPasswordFormComponent } from './pages/reset-password-form/reset-password-form.component';


@NgModule({
  declarations: [
    SignupComponent,
    SignupFormComponent,
    SigninComponent,
    SigninFormComponent,
    AccountComponent,
    UsersManagmentComponent,
    ToolsManagmentComponent,
    ConfirmActionComponent,
    UpdateUserFormComponent,
    InvitedUsersComponent,
    InviteToStackComponent,
    ResetPasswordSendComponent,
    ResetPasswordFormComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    ButtonsIndicatorsModule,
    FormsControlsModule,
    LayoutModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    PopupsModalsModule
  ]
})
export class ProfileModule { }
