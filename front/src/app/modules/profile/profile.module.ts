import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ButtonsIndicatorsModule } from '../../shared/modules/material/buttons-indicators/buttons-indicators.module';
import { FormsControlsModule } from '../../shared/modules/material/forms-controls/forms-controls.module';
import { LayoutModule } from '../../shared/modules/material/layout/layout.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { SignupComponent } from './pages/signup/signup.component';
import { SignupFormComponent } from './components/signup-form/signup-form.component';
import { SigninComponent } from './pages/signin/signin.component';
import { SigninFormComponent } from './components/signin-form/signin-form.component';
import { AccountComponent } from './pages/account/account.component';


@NgModule({
  declarations: [SignupComponent, SignupFormComponent, SigninComponent, SigninFormComponent, AccountComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    ButtonsIndicatorsModule,
    FormsControlsModule,
    LayoutModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ProfileModule { }
