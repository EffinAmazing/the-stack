import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsControlsModule } from './modules/material/forms-controls/forms-controls.module';
import { LayoutModule } from './modules/material/layout/layout.module';
import { ButtonsIndicatorsModule } from './modules/material/buttons-indicators/buttons-indicators.module';
import { CommonBehaviorsModule } from './modules/material/common-behaviors/common-behaviors.module';
import { SigninFromComponent } from './components/signin-from/signin-from.component';
import { HeaderComponent } from './components/header/header.component';



@NgModule({
  declarations: [SigninFromComponent, HeaderComponent, HeaderComponent],
  imports: [
    CommonModule,
    FormsControlsModule,
    LayoutModule,
    ButtonsIndicatorsModule,
    CommonBehaviorsModule,
    RouterModule
  ],
  exports: [
    HeaderComponent
  ]
})
export class SharedModule { }
