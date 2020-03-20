import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-delete-stack-dialog',
  templateUrl: './delete-stack-dialog.component.html',
  styleUrls: ['./delete-stack-dialog.component.scss']
})
export class DeleteStackDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DeleteStackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
