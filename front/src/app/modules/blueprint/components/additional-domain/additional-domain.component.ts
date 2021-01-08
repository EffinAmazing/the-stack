import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-additional-domain',
  templateUrl: './additional-domain.component.html',
  styleUrls: ['./additional-domain.component.scss']
})
export class AdditionalDomainComponent {
  isProcced = false;
  domain = '';

  constructor(public dialogRef: MatDialogRef<AdditionalDomainComponent>,
    private service: BlueprintsService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  public handleInput(evt) {
    let value = evt.target.value;
    if (value) {
      value = value.replace('https://', '');
      value = value.replace('http://', '');
      const arr = value.split('/');
      value = arr[0];
      evt.target.value = value;
    }
    this.domain = value;
  }

  proccedAddTool(){
    this.isProcced = true;
    this.service.addDomainTool(this.domain, this.data.blueprint.id).toPromise().then(res => {
      this.dialogRef.close(res);
    }).catch(err => {
      console.log(err);
      this.dialogRef.close();
    })
  }
  
  onNoClick(): void {
    //
    this.dialogRef.close();
  }
}
