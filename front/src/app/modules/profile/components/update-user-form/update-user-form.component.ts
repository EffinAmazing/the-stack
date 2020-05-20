import {Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { BluePrintTool } from '../../../../shared/models/tool';

@Component({
  selector: 'app-update-user-form',
  templateUrl: './update-user-form.component.html',
  styleUrls: ['./update-user-form.component.scss']
})
export class UpdateUserFormComponent  {
  userForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<UpdateUserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.userForm = new FormGroup({
        email: new FormControl(data.user.email, [ Validators.email ]),
        firstName: new FormControl(data.user.firstName, [Validators.required]),
        lastName: new FormControl(data.user.lastName, [Validators.required]),
        role: new FormControl( typeof data.user.role !== 'undefined' ? data.user.role : 1),
        verified: new FormControl(data.user.verified ? data.user.verified : false)
      });
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onUpdateClick() {
    if ( this.userForm.valid ) {
      this.dialogRef.close(this.userForm.value);
    }
  }
}
