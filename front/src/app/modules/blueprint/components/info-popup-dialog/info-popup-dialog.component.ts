import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-info-popup-dialog',
  templateUrl: './info-popup-dialog.component.html',
  styleUrls: ['./info-popup-dialog.component.scss']
})
export class InfoPopupDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<InfoPopupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
