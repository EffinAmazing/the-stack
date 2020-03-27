import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { BluePrintTool } from '../../../../shared/models/tool';
import { environment } from '../../../../../environments/environment';


const host = environment.serverURI;

@Component({
  selector: 'app-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.scss']
})

export class NodeDetailsComponent  {
  nodeForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NodeDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { node: BluePrintTool, blueprintId: string }) {
      console.log(data);
      this.nodeForm = new FormGroup({
        start: new FormControl(data.node.start),
        end: new FormControl(data.node.end),
        owner: new FormControl(data.node.owner ? data.node.owner : ''),
        cost: new FormControl(data.node.cost ? data.node.cost : ''),
        trainedOn: new FormControl(data.node.trainedOn ? data.node.trainedOn : '')
      });

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
