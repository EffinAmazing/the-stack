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

  constructor(private router: Router) { }

  ngOnInit(): void {  }

  submitDomain() {
    if (!this.domain.invalid) {
      this.router.navigateByUrl('/blueprints/build?domain=' + this.domain.value);
    }
  }
}
