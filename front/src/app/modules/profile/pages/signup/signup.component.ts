import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SignUPFormData } from '../../../../shared/models/users';
import { UsersService } from '../../../../core/services/users.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  isLoading = false;
  isError = false;
  errorMessage = 'Failed signup, please try again!';
  code: string;
  userData: BehaviorSubject<any> = new BehaviorSubject(null);
  id: string | null = null;

  constructor(private service: UsersService, private router: Router, private route: ActivatedRoute) {
    this.code = route.snapshot.params['code'];
    // console.log(this.code);
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

  public handleSubmit(data: SignUPFormData) {
    this.isLoading = true;
    console.log(data, this.id);

    if (!this.id) {
      this.service.createUser(data).toPromise().then(res => {
        console.log(res);
        this.isLoading = false;

        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl('/profile/signin', { skipLocationChange: false });
        // window.location.href = window.location.origin + window.location.pathname + '#/profile/signin';
        // window.location.reload();
      }).catch((err) => {
        this.isLoading = false;
        this.isError = true;
        console.log(err, err.data);
      });
    } else {
      console.log('this.id', this.id);
      this.service.completeUserSignup(this.id, this.code, data).toPromise().then(res => {
        this.isLoading = false;

        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl('/profile/signin', { skipLocationChange: false });
      }).catch(err => {
        this.isLoading = false;
        this.isError = true;
        console.log(err);
      });
    }
  }

}
