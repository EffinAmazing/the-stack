import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; 

import { BlueprintRoutingModule } from './blueprint-routing.module';
import { BuildStackComponent } from './pages/build-stack/build-stack.component';
import { ShareComponent } from './pages/share/share.component';
import { SharedModule } from '../../shared/shared.module';
import { CommonBehaviorsModule } from '../../shared/modules/material/common-behaviors/common-behaviors.module';
import { ButtonsIndicatorsModule } from '../../shared/modules/material/buttons-indicators/buttons-indicators.module';
import { FormsControlsModule } from '../../shared/modules/material/forms-controls/forms-controls.module';
import { LayoutModule } from '../../shared/modules/material/layout/layout.module';
import { BuilderComponent } from './components/builder/builder.component';
import { ToolsListComponent } from './components/tools-list/tools-list.component';
import { DeleteStackDialogComponent } from './components/delete-stack-dialog/delete-stack-dialog.component';
import { CreateNewStackDialogComponent } from './components/create-new-stack-dialog/create-new-stack-dialog.component';
import { PopupsModalsModule } from "../../shared/modules/material/popups-modals/popups-modals.module";
import { NodeDetailsComponent } from './components/node-details/node-details.component';


@NgModule({
  declarations: [BuildStackComponent, ShareComponent, BuilderComponent, ToolsListComponent, DeleteStackDialogComponent, CreateNewStackDialogComponent, NodeDetailsComponent],
  imports: [
    CommonModule,
    BlueprintRoutingModule,
    HttpClientModule,
    SharedModule,
    CommonBehaviorsModule,
    ButtonsIndicatorsModule,
    FormsControlsModule,
    LayoutModule,
    PopupsModalsModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]

})
export class BlueprintModule { }
