import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  domain = new FormControl('', [Validators.pattern(/^([a-z.\-]+(\.)[a-z]{2,3})$/i)]);
  outsideData: {
    title: string,
    subtitle: string,
    heroImage: string,
    abilities: Array<{ title: string, icon: string, description: string }>
  } | null = null;
  defaultRepeater: Array<{ title: string, icon: string, description: string }> = [];

  constructor(private router: Router) {
    console.log(' test ');
    if (window['outsideData']) {
      this.outsideData = window['outsideData'];

      console.log(' *** this.defaultRepeater *** ', this.defaultRepeater);
    }

    this.defaultRepeater.push({
      title: 'Manage your existing stack',
      icon: this.getAssetsFolder() + 'assets/images/default-icon.png',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    });

    this.defaultRepeater.push({
      title: 'Manage your existing stack',
      icon: this.getAssetsFolder() + 'assets/images/default-icon.png',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    });

    this.defaultRepeater.push({
      title: 'Manage your existing stack',
      icon: this.getAssetsFolder() + 'assets/images/default-icon.png',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    });

    this.defaultRepeater.push({
      title: 'Manage your existing stack',
      icon: this.getAssetsFolder() + 'assets/images/default-icon.png',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, \
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    });

    if (this.outsideData) {
      this.defaultRepeater = this.outsideData.abilities;
    }

  }

  ngOnInit(): void {  }

  submitDomain() {
    if (!this.domain.invalid) {
      this.router.navigateByUrl('/blueprints/build?domain=' + this.domain.value);
    }
  }

  handleInput(data) {
    let value = data.target.value;
    if (value) {
      value = value.replace('https://', '');
      value = value.replace('http://', '');
      const arr = value.split('/');
      value = arr[0];
      data.target.value = value;
      this.domain.setValue( value );
    }
  }

  public getAssetsFolder() {
    if (typeof window['assets'] !== 'undefined') {
      return window['assets'];
    } else {
      return '/';
    }
  }
}
