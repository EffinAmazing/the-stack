import {Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Tool } from '../../../../shared/models/tool';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { environment } from '../../../../../environments/environment';

const host = environment.serverURI;
const timeout = 300;

@Component({
  selector: 'app-add-new-tool-dialog',
  templateUrl: './add-new-tool-dialog.component.html',
  styleUrls: ['./add-new-tool-dialog.component.scss']
})
export class AddNewToolDialogComponent {
  tool: Tool | null = null;
  toolSearchName = '';
  cachedValue = '';
  toolsDataLoaded = false;
  runedTimeout = false;
  tools: Tool[] = [];
  selected: { [key: string]: Tool } = {};

  constructor(
    public dialogRef: MatDialogRef<AddNewToolDialogComponent>,
    private service: BlueprintsService,
    @Inject(MAT_DIALOG_DATA) public data: { blueprintId: string }) {

    }

    public handleInputText(evt) {
      // console.log(evt.data, evt.target.value);
      if (evt.target.value !== '') {
        if (!this.runedTimeout) {
          this.runedTimeout = true;
          setTimeout(() => {
            this.getToolsData();
          }, timeout);
        }
      }
    }

    private getToolsData() {
      if (this.toolSearchName !== this.cachedValue) {
        this.cachedValue = this.toolSearchName;
        this.runedTimeout = true;
        setTimeout(() => {
          this.runedTimeout = false;
          this.getToolsData();
        }, timeout);
      } else {
        this.runedTimeout = false;
        console.log(this.toolSearchName);
        this.service.getToolsList(this.toolSearchName, this.data.blueprintId).toPromise().then((result) => {
          this.tools = result;
          this.toolsDataLoaded = true;
        }).catch(err => {
          console.log(err);
        });
      }
    }

    public handleCreateNewTool() {
      this.dialogRef.close('create');
    }

    public handleSelectTool(tool: Tool) {
      if (this.selected[tool.id]) {
        delete this.selected[tool.id];
      } else {
        this.selected[tool.id] = tool;
      }
    }

    public isToolSlected(toolId: string): boolean {
      return !!this.selected[toolId];
    }

    public getAssetsFolder() {
      if (typeof window['assets'] !== 'undefined') {
        return window['assets'];
      } else {
        return '/';
      }
    }

    public processImageSrc(link) {
      if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1 ) {
        return link;
      } else {
        return host + link;
      }
    }

    public isSelectedAnyTool(): boolean {
      let isSelcted = false;
      for (const key in this.selected) {
        if (this.selected.hasOwnProperty(key)) {
          isSelcted = true;
          break;
        }
      }

      return isSelcted;
    }

    onNoClick(): void {
      this.dialogRef.close();
    }
}
