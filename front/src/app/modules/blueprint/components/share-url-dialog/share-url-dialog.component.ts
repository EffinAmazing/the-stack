import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { exportElementAsBlob, applyWatermark, exportElementAsDataUrl, applyWatermarkToDataUrl } from 'src/app/shared/utils/export-utils'; // adjust path
// If you prefer no util file, you can inline the two functions in this component.

@Component({
  selector: 'app-share-url-dialog',
  templateUrl: './share-url-dialog.component.html',
  styleUrls: ['./share-url-dialog.component.scss']
})
export class ShareUrlDialogComponent implements OnInit, OnDestroy {

  imageObjectUrl: string | null = null;   // raw blob URL (for revoke)
  imageDataUrl: string | null = null;
  imageSafeUrl: SafeUrl | null = null;

  url: string;
  copied = false;

  // preview state
  loaded = false;
  isError = false;


  // set this to where your watermark PNG lives
  // Must be same-origin or served with Access-Control-Allow-Origin, since we draw onto canvas
  private watermarkUrl = this.getAssetsFolder() + 'assets/images/watermark.png';

  // export sizing for #stackWorkflow
  private readonly W = 1170;
  private readonly H = 660;

  constructor(
    public dialogRef: MatDialogRef<ShareUrlDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string; domain?: string },
    private sanitizer: DomSanitizer
  ) {
    this.url = data.url;
  }

  async ngOnInit() {
    this.loaded = false; this.isError = false;
    try {
      const el = document.querySelector('#stackWorkflow') as HTMLElement | null;
      if (!el) throw new Error('#stackWorkflow not found');

      const baseDataUrl = await exportElementAsDataUrl(el, {
        scale: 1,
        width: this.W, height: this.H,
        clip: { x: 0, y: 0, width: this.W, height: this.H },
        hideClass: 'export-tight',
        styleOverride: { padding: '0px', borderRadius: '0px', margin: '0px' },
        filter: (node: HTMLElement) => {
          const c = node.classList?.value || '';
          if (c.includes('cdk-drag-preview')) return false;
          if (c.includes('mat-ripple')) return false;
          if (c.includes('seletor-area-box')) return false;
          if (c.includes('moved-selected-area')) return false;
          return true;
        },
      });

      const watermarkedDataUrl = await applyWatermarkToDataUrl(baseDataUrl, this.watermarkUrl, {
        opacity: 0.7, scale: 0.11, margin: 20, position: 'bottom-right'
      });

      this.imageDataUrl = watermarkedDataUrl;
      this.imageSafeUrl = this.sanitizer.bypassSecurityTrustUrl(watermarkedDataUrl);
      this.loaded = true;
    } catch (e) {
      console.error(e);
      this.isError = true;
      this.loaded = true;
    }
  }

  ngOnDestroy() {
    if (this.imageObjectUrl) URL.revokeObjectURL(this.imageObjectUrl);
  }

  copyUrl() {
    navigator.clipboard.writeText(this.url).then(() => {
      this.copied = true;
      setTimeout(() => this.dialogRef.close(), 2000);
    });
  }

  close() {
    this.dialogRef.close();
  }

  public getAssetsFolder() {
    if (typeof window['assets'] !== 'undefined') {
      return window['assets'];
    } else {
      return '/';
    }
  }

  downloadImage() {
    if (!this.imageDataUrl) return;
    const domainPart = this.data.domain
      ? this.data.domain.replace(/^www\./, '').replace(/[^a-z0-9\-]/gi, '_')
      : 'stack';
    const datePart = new Date().toISOString().slice(0, 10);
    const filename = `${domainPart}-${datePart}-stack-builder-share.png`;

    const a = document.createElement('a');
    a.href = this.imageDataUrl; // data URL
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  
}
