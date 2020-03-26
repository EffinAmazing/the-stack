import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';



@NgModule({
  declarations: [],
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDatepickerModule
  ],
  exports: [
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDatepickerModule
  ],
  providers: [
    MatDatepickerModule,
  ],
})
export class FormsControlsModule { }
