import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { environment } from '../../../../../environments/environment';

const host = environment.serverURI;

@Component({
  selector: 'app-tool-icon-cropper',
  templateUrl: './tool-icon-cropper.component.html',
  styleUrls: ['./tool-icon-cropper.component.scss']
})
export class ToolIconCropperComponent  {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  fileUrl = '';
  croppedImgSrc: string = '';

  constructor(  public dialogRef: MatDialogRef<ToolIconCropperComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any) { }

  public handleFileInputChange() {
    const file = this.fileInput.nativeElement.files[0];
    const fileRider =  new FileReader();

    fileRider.addEventListener('load', () => {
      // convert image file to base64 string
      this.fileUrl = fileRider.result as string;
    }, false);

    fileRider.readAsDataURL(file);
  }

  public handleClickChooseImage() {
    this.fileInput.nativeElement.click();
  }

  public handleUpdateImage(uri: string): void {
    this.croppedImgSrc = uri;
  }

  onSaveClick() {
    this.dialogRef.close(this.croppedImgSrc);
  }

  onCloseClick() {
    this.dialogRef.close();
  }
}
