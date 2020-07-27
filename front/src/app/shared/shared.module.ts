import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsControlsModule } from './modules/material/forms-controls/forms-controls.module';
import { LayoutModule } from './modules/material/layout/layout.module';
import { ButtonsIndicatorsModule } from './modules/material/buttons-indicators/buttons-indicators.module';
import { CommonBehaviorsModule } from './modules/material/common-behaviors/common-behaviors.module';
import { HeaderComponent } from './components/header/header.component';
import { SignupSigninPopupComponent } from './components/signup-signin-popup/signup-signin-popup.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ImageCropperComponent } from './components/image-cropper/image-cropper.component';
import { ConfirmActionDialogComponent } from './components/confirm-action-dialog/confirm-action-dialog.component';



@NgModule({
  declarations: [ HeaderComponent, SignupSigninPopupComponent, ImageCropperComponent, ConfirmActionDialogComponent ],
  imports: [
    CommonModule,
    FormsControlsModule,
    LayoutModule,
    ButtonsIndicatorsModule,
    CommonBehaviorsModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule
  ],
  exports: [
    HeaderComponent,
    SignupSigninPopupComponent,
    ImageCropperComponent,
    ConfirmActionDialogComponent
  ]
})
export class SharedModule { }
