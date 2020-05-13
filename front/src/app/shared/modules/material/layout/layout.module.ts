import { NgModule } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';

@NgModule({
  declarations: [],
  imports: [
    MatCardModule,
    MatExpansionModule,
    MatDividerModule,
    MatToolbarModule
  ],
  exports: [
    MatCardModule,
    MatExpansionModule,
    MatListModule,
    MatToolbarModule
  ]
})
export class LayoutModule { }
