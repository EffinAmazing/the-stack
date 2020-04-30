import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignUPFormData } from '../../../../shared/models/users';
import { UsersService } from '../../../../core/services/users.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  isLoading = false;
  isError = false;
  errorMessage = 'Failed signup, please try again!';

  constructor(private service: UsersService, private router: Router) { }

  ngOnInit(): void {

  }

  public handleSubmit(data: SignUPFormData) {
    this.isLoading = true;
    console.log(data);

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
  }

}
