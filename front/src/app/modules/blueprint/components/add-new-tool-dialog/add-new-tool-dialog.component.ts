import {Component, Inject} from '@angular/core';
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
  runedTimout = false;
  tools: Tool[] = [];
  selected: { [key: string]: Tool } = {};

  constructor(
    public dialogRef: MatDialogRef<AddNewToolDialogComponent>,
    private service: BlueprintsService,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    }

    public handleInputText(evt) {
      // console.log(evt.data, evt.target.value);
      if (evt.target.value !== '') {
        if (!this.runedTimout) {
          this.runedTimout = true;
          setTimeout(() => {
            this.getToolsData();
          }, timeout);
        }
      }
    }

    private getToolsData() {
      if (this.toolSearchName !== this.cachedValue) {
        this.cachedValue = this.toolSearchName;
        this.runedTimout = true;
        setTimeout(() => {
          this.runedTimout = false;
          this.getToolsData();
        }, timeout);
      } else {
        this.runedTimout = false;
        console.log(this.toolSearchName);
        this.service.getToolsList(this.toolSearchName).toPromise().then((result) => {
          this.tools = result;
        }).catch(err => {
          console.log(err);
        });
      }
    }

    public handleSelectTool(tool: Tool) {
      if (!tool.nodeId) {
        if (this.selected[tool.id]) {
          delete this.selected[tool.id];
        } else {
          this.selected[tool.id] = tool;
        }
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

    public isSelectedAnyTool(): boolean{
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
