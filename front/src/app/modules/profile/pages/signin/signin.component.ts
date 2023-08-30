import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignUPFormData } from '../../../../shared/models/users';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  isLoading = false;
  isError = false;
  errorMessage = 'Failed signin, please try again!';

  constructor(private service: AuthService, private router: Router) { 

  }

  ngOnInit(): void {

  }

  handleSubmitForm(data) {
    this.isLoading = true;
    this.service.login(data.email, data.password).toPromise().then( res => {
      console.log(res);
      this.isLoading = false;
      if (res === 'Error') {
        this.isError = true;
      } else {
        this.service.setSession(res);
        window['dataLayer'].push({
          event: 'stackbuilder.signin',
          user: {
            email: res.user.email,
            firstName: res.user.firstName,
            lastName: res.user.lastName
          }
        }); 
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl('/profile', { skipLocationChange: false });
      }
      /*window.location.href = window.location.origin + window.location.pathname + '#/profile';
      window.location.reload();
      */
    }).catch(err => {
      console.log(err);
      this.isError = true;
      this.isLoading = false;

    });
  }

}
