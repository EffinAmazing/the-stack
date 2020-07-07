import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import Cropper from 'cropperjs';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements OnInit, AfterViewInit {
  @Input() imgSrc: string;
  @ViewChild('imageForCropping') imageForCropping: ElementRef<HTMLImageElement>;
  @Output() cropImageUpdated: EventEmitter<string> = new EventEmitter();
  imageDestination: string;

  constructor() { }

  ngOnInit(): void {
  }

  public ngAfterViewInit() {
    console.log(this.imageForCropping);
    if (this.imageForCropping) {
      const image = this.imageForCropping.nativeElement;
      const cropper = new Cropper(image, {
        zoomable: false,
        scalable: false,
        aspectRatio: 1,
        crop: (event) => {
          const canvas = cropper.getCroppedCanvas();

          this.imageDestination = canvas.toDataURL("image/png");
          this.cropImageUpdated.emit(this.imageDestination);
        }
      });
    }
  }

}
