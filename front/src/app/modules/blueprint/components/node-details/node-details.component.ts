import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';
import { BluePrintTool } from '../../../../shared/models/tool';
import { environment } from '../../../../../environments/environment';


const host = environment.serverURI;

@Component({
  selector: 'app-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss']
})

export class NodeDetailsComponent  {

  constructor(
    public dialogRef: MatDialogRef<NodeDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { node: BluePrintTool, blueprintId: string }) {
      console.log(data);
    }

  public processImageSrc(link) {
    if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1 ) {
      return link;
    } else {
      return host + link;
    }
  }

  public getAssetsFolder() {
    if (typeof window['assets'] !== 'undefined') {
      return window['assets'];
    } else {
      return '/';
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
