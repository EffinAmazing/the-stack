import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.scss']
})
export class ResetPasswordFormComponent implements OnInit {
  isLoading = false;
  isError = false;
  errorMessage = 'Request is fial, please try leter';
  password = new FormControl('', [Validators.required, Validators.minLength(6)]);
  cofirmPassword = new FormControl('', [Validators.required, Validators.minLength(6)]);
  isSuccess = false;
  code: string;

  constructor(private service: UsersService, private router: Router, private route: ActivatedRoute) { 
    this.code = route.snapshot.params['code'];
  }

  ngOnInit(): void {

  }

  handleSubmitForm() {
    if (!this.password.invalid && !this.cofirmPassword.invalid) {
      if (this.password.value === this.cofirmPassword.value) {
        this.service.resetPassword(this.code, this.password.value).toPromise().then(res => {
          this.isSuccess = true;
          this.isError = false;
        }).catch(err => {
          console.log(err);
          this.errorMessage = 'Request is fial, please try leter';
          this.isError = true;
          this.isSuccess = false;
        });
      } else {
        this.errorMessage = 'Password needs to be equal to Confirm Password';
        this.isError = true;
        this.isSuccess = false;
      }
    }
  }
}
