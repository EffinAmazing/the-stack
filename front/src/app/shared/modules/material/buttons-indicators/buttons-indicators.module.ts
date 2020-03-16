import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [],
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule
  ],
  exports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule
  ]
})
export class ButtonsIndicatorsModule { }
