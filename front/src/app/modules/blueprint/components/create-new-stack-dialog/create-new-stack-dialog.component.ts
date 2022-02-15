import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-create-new-stack-dialog',
  templateUrl: './create-new-stack-dialog.component.html',
  styleUrls: ['./create-new-stack-dialog.component.scss']
})
export class CreateNewStackDialogComponent {
  domain: any;

  constructor(
    public dialogRef: MatDialogRef<CreateNewStackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  public handleInput(evt) {
    let value = evt.target.value;
    if (value) {
      value = value.replace('https://', '');
      value = value.replace('http://', '');
      const arr = value.split('/');
      value = arr[0].toLowerCase();
      evt.target.value = value;
    }
    this.domain = value;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  submitDomain() {
    console.log(this.domain, this.data.domain);
    if (this.domain && /^([a-z.\-]+(\.)[a-z]{2,3})$/i.test(this.domain)) {
      this.dialogRef.close(this.domain);
      //
    }
  }

}
