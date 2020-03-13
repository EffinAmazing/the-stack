import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsControlsModule } from './modules/material/forms-controls/forms-controls.module';
import { LayoutModule } from './modules/material/layout/layout.module';
import { ButtonsIndicatorsModule } from './modules/material/buttons-indicators/buttons-indicators.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsControlsModule,
    LayoutModule,
    ButtonsIndicatorsModule
  ],
})
export class SharedModule { }
