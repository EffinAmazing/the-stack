import { NgModule } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [],
  imports: [
    MatCardModule,
    MatExpansionModule,
    MatDividerModule
  ],
  exports: [
    MatCardModule,
    MatExpansionModule,
    MatListModule
  ]
})
export class LayoutModule { }
