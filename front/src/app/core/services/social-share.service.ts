import { Injectable } from '@angular/core';
import { image } from 'html2canvas/dist/types/css/types/image';

@Injectable({
  providedIn: 'root'
})
export class SocialShareService {
  width = 500;
  height = 300;

  constructor() { }

  shareInFaceBook(text, image) {
    const url = 'https://www.facebook.com/sharer/sharer.php?u=' + image;
    const left = (screen.width / 2) - (this.width / 2);
    const top = (screen.height / 2) - (this.height / 2);

    const isOpen = window.open(
      url,
      '_blank',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=' +
        this.width + ',height=' + this.height + ',top=' + top + ',left=' + left);

    if (!isOpen) {
      setTimeout(() => {
        console.log(' link click ');
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.click();
      }, 100);
    }
  }

  shareInTwitter(img) {
    const url = 'https://twitter.com/home?status=' + img;
    const left = (screen.width / 2) - (this.width / 2);
    const top = (screen.height / 2) - (this.height / 2);

    const isOpen = window.open(
      url,
      '_blank',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=' +
        this.width + ',height=' + this.height + ',top=' + top + ',left=' + left);

    if (!isOpen) {
      setTimeout(() => {
        console.log(' link click ');
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.click();
      }, 100);
    }
  }

  shareInLinkedIn(image, title) {
    const url = 'https://www.linkedin.com/shareArticle?mini=true&url=' + image + '&title=' + title;
    const left = (screen.width / 2) - (this.width / 2);
    const top = (screen.height / 2) - (this.height / 2);

    const isOpen = window.open(
      url,
      '_blank',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=' +
        this.width + ',height=' + this.height + ',top=' + top + ',left=' + left);

    if (!isOpen) {
      setTimeout(() => {
        console.log(' link click ');
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.click();
      }, 100);
    }
  }
}
