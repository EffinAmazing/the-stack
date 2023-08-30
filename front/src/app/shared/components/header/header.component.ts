import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() user: any;

  constructor(private auth: AuthService, private router: Router) { }

  logout() {
    console.log('logout');
    window['dataLayer'].push({
      event: 'stackbuilder.logout',
      user: {
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName        
      }
    });
    this.auth.logout();
    this.router.navigateByUrl('/profile/signin');

  }

  ngOnInit(): void {

  }

}
