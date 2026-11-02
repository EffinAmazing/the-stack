import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonBehaviorsModule } from '../../../../shared/modules/material/common-behaviors/common-behaviors.module';
import { ButtonsIndicatorsModule } from '../../../../shared/modules/material/buttons-indicators/buttons-indicators.module';
import { FormsControlsModule } from '../../../../shared/modules/material/forms-controls/forms-controls.module';
import { LayoutModule } from '../../../../shared/modules/material/layout/layout.module';
import { PopupsModalsModule } from '../../../../shared/modules/material/popups-modals/popups-modals.module';
import { CreateCustomToolDialogComponent } from './create-custom-tool-dialog.component';
import { ToolIconCropperComponent } from '../tool-icon-cropper/tool-icon-cropper.component';

// The Create Tool modal is used on the stack page (BlueprintModule) and on admin Tools (ProfileModule).
@NgModule({
  declarations: [CreateCustomToolDialogComponent, ToolIconCropperComponent],
  entryComponents: [CreateCustomToolDialogComponent, ToolIconCropperComponent],
  imports: [
    CommonModule,
    SharedModule,
    CommonBehaviorsModule,
    ButtonsIndicatorsModule,
    FormsControlsModule,
    LayoutModule,
    PopupsModalsModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  exports: [CreateCustomToolDialogComponent, ToolIconCropperComponent]
})
export class CreateCustomToolDialogModule { }
