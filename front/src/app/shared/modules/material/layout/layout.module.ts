import { NgModule } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';


@NgModule({
  declarations: [],
  imports: [
    MatCardModule,
    MatExpansionModule
  ],
  exports: [
    MatCardModule,
    MatExpansionModule
  ]
})
export class LayoutModule { }
