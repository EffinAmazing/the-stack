import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-load-empty-stack-dialog',
  templateUrl: './load-empty-stack-dialog.component.html',
  styleUrls: ['./load-empty-stack-dialog.component.scss']
})
export class LoadEmptyStackDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<LoadEmptyStackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { domain: string, errorMessage: string }) {
      //
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
