import { Injectable } from '@angular/core';
import { image } from 'html2canvas/dist/types/css/types/image';

@Injectable({
  providedIn: 'root'
})
export class SocialShareService {
  width = 500;
  height = 300;

  constructor() { }

  prepareContent(popup) {
    popup.document.body.innerHTML = `<style> * { font-family: Roboto, sans-serif; } </style>
    <h1 align="center"> Please wait, data is processing ... </h1>
    <p align="center"> it will take few seconds </p>`;
  }

  shareInFaceBook(text, image, popup) {
    const url = 'https://www.facebook.com/sharer/sharer.php?u=' + image;

    popup.location.href = url;
    /* */
  }

  shareInTwitter(img, popup) {
    const url = 'https://twitter.com/intent/tweet?url=' + img;

    popup.location.href = url;
  }

  shareInLinkedIn(image, title, popup) {
    const url = 'https://www.linkedin.com/shareArticle?mini=true&url=' + image + '&title=' + title;

    popup.location.href = url;
  }

  shareInEmail(image: string, popup, domain) {
    const url = `mailto:email@type?subject=Marketing Tools Stack for ${domain}&body=screen <${image}>`;

    popup.document.body.innerHTML = `<a id="link_forsharing" href="${url}">
      <img src="cid:share_image" style="visibility: hidden" /><img id="share_image" src="${image}" /></a>`;
    setTimeout(() => {
      popup.document.querySelector('#link_forsharing').click();
    }, 200);

    setTimeout(() => {
      // console.log(popup.location.protocol === 'about:');
      if (popup.location.protocol === 'about:') {
        popup.close();
      } else {
        console.log(popup);
        popup.resizeTo(800, 600);
      }
    }, 900);
  }
}
