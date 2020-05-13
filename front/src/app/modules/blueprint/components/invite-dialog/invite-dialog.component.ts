import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { BluePrintTool } from '../../../../shared/models/tool';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss']
})
export class InviteDialogComponent {
  email: FormControl;

  constructor(
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { blueprintId: string }) {
      this.email = new FormControl('', [Validators.email]);
    }

  sendInvite() {
    console.log(this.email);
    if ( !this.email.invalid ) {
      const url = window.location.href.replace(window.location.hash, '');
      this.dialogRef.close({
        emails: [this.email.value],
        blueprintId: this.data.blueprintId,
        url
      });
    }
  }
}
