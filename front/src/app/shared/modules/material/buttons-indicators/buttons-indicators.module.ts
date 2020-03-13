import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [],
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule
  ],
  exports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule
  ]
})
export class ButtonsIndicatorsModule { }
