import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SignUPFormData } from '../../../../shared/models/users';
import { UsersService } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  isLoading = false;
  isError = false;
  errorMessage = 'Failed signup. ';
  isDupError = false;
  code: string;
  userData: BehaviorSubject<any> = new BehaviorSubject(null);
  id: string | null = null;
  allowResetPassword = false;

  constructor(private service: UsersService, private router: Router, private route: ActivatedRoute, private auth: AuthService) {
    this.code = route.snapshot.params['code'];
    // console.log(this.code);
    window['dataLayer'] = window['dataLayer'] || [];
  }

  ngOnInit(): void {
    this.service.getUserByCode(this.code).toPromise()
      .then(result => {
        this.userData.next( result );
        this.id = result._id;
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  private loginAfterSignUp(data) {
    this.auth.login(data.email, data.password).toPromise().then(res => {
      if (res === 'Error') {
        this.isError = true;
      } else {
        console.log('loginAfterSignUp');
        this.auth.setSession(res);
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
    }).catch(err => {
      console.log(err);
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigateByUrl('/profile/signin', { skipLocationChange: false });
    });
  }

  public handleSubmit(data: SignUPFormData) {
    this.isLoading = true;
    console.log(data, this.id);

    if (!this.id) {
      this.service.createUser(data).toPromise().then(res => {
        console.log(res);
        this.isLoading = false;
        window['dataLayer'].push({
          event: 'stackbuilder.signup',
          user: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
          }
        });
        /**/
        // window.location.href = window.location.origin + window.location.pathname + '#/profile/signin';
        // window.location.reload();
        this.loginAfterSignUp(data);
      }).catch((err) => {
        this.isLoading = false;
        this.isError = true;
        console.log(err, err.data);
      });
    } else {
      console.log('this.id', this.id);
      this.service.completeUserSignup(this.id, this.code, data).toPromise().then(res => {
        this.isLoading = false;
        window['dataLayer'].push({
          event: 'stackbuilder.signup',
          user: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
          }
        });
        this.loginAfterSignUp(data);
      }).catch(err => {
        this.isLoading = false;
        this.isError = true;
        let message = '';
        if (err.error.type === 'EmailDuplication') {
          message = ' User with this email is already created';
          this.allowResetPassword = true;
        }
        this.errorMessage += message;
        console.log(err);
      });
    }
  }

}
