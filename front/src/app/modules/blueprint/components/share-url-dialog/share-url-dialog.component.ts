import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-share-url-dialog',
  templateUrl: './share-url-dialog.component.html',
  styleUrls: ['./share-url-dialog.component.scss']
})
export class ShareUrlDialogComponent {
  url: string;
  copied = false; // <-- This is internal state

  constructor(
    public dialogRef: MatDialogRef<ShareUrlDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string }
  ) {
    this.url = data.url;
  }

  copyUrl() {
    navigator.clipboard.writeText(this.url).then(() => {
      this.copied = true;

      // Auto-close after 3 seconds
      setTimeout(() => {
        this.dialogRef.close();
      }, 2000);
    });
  }

  close() {
    this.dialogRef.close();
  }
}

