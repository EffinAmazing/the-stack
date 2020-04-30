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
    this.service.login(data.email, data.password).toPromise().then( res => {
      console.log(res);
      /*this.service.setSession(res);
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigateByUrl('/profile', { skipLocationChange: false });
      window.location.href = window.location.origin + window.location.pathname + '#/profile';
      window.location.reload();
      */
    }).catch(err => {
      console.log(err);
    });
  }

}
