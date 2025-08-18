import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-additional-app',
  templateUrl: './additional-app.component.html',
  styleUrls: ['./additional-app.component.scss']
})
export class AdditionalAppComponent {
  isProcced = false;
  app = '';

  constructor(public dialogRef: MatDialogRef<AdditionalAppComponent>,
    private service: BlueprintsService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  public handleInput(evt) {
    let value = evt.target.value;
    /*
    if (value) {
      value = value.replace('https://', '');
      value = value.replace('http://', '');
      const arr = value.split('/');
      value = arr[0].toLowerCase();
      evt.target.value = value;
    }*/
    this.app = value;
  }

  proccedAddApp(){
    
    if (!this.isProcced) {
      this.isProcced = true;
      this.service.addAppTool(this.app, this.data.blueprint.id).toPromise().then(res => {
        this.dialogRef.close(res);
      }).catch(err => {
        console.log(err);
        this.dialogRef.close();
      });
    }
  }
  
  onNoClick(): void {
    //
    this.dialogRef.close();
  }
}
