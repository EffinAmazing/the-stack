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
  ownerTemp: string = '';
  trainOnTemp: string = '';

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

  public getOwners(): string[] {
    const owners = this.nodeForm.get('owner').value;

    if (owners === '') {
      return [];
    } else {
      return owners.split(',');
    }
  }

  public getTrainedOn(): string[] {
    const trainedOn = this.nodeForm.get('trainedOn').value;

    if (trainedOn === '') {
      return [];
    } else {
      return trainedOn.split(',');
    }
  }

  public addOwner(email: string): void {
    let owners = this.nodeForm.get('owner').value;

    let list = owners.split(',');

    if (owners === '') {
      list = [];
    }

    const duplicat = list.find(item => item === email);
    if (!duplicat) {
      list.push(email);
    }

    owners = list.join(',');
    this.nodeForm.get('owner').setValue(owners)
  }

  public addTrainedOn(email: string): void{
    let trainedOn = this.nodeForm.get('trainedOn').value;

    let list = trainedOn.split(',');

    if (trainedOn === '') {
      list = [];
    }

    const duplicat = list.find(item => item === email);
    if (!duplicat) { 
      list.push(email);
    }

    trainedOn = list.join(',');
    this.nodeForm.get('trainedOn').setValue(trainedOn)
  }

  public removeOwner(email: string): void {
    let owners = this.nodeForm.get('owner').value;
    const list:string[] = owners.split(',');
    const index = list.findIndex((item) => item === email);
    if (index !== -1) {
      list.splice(index, 1);
      owners =  list.join(',');
      this.nodeForm.get('owner').setValue(owners);
    }
  }

  public removeTrainedOn(email: string) {
    let trainedOn = this.nodeForm.get('trainedOn').value;
    const list:string[] = trainedOn.split(',');
    const index = list.findIndex((item) => item === email);
    console.log('index', index);
    if (index !== -1) {
      list.splice(index, 1);
      trainedOn =  list.join(',');
      this.nodeForm.get('trainedOn').setValue(trainedOn);
    }
  }

  public handleAddOwner(){
    // console.log(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test( this.ownerTemp ), this.ownerTemp);

    if ( /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test( this.ownerTemp ) ) {
      this.addOwner(this.ownerTemp);
      this.ownerTemp = '';
    }
     
  }

  public handleAddTrainedOn () {
    if ( /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test( this.trainOnTemp ) ) {
      this.addTrainedOn(this.trainOnTemp);
      this.trainOnTemp = '';
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
