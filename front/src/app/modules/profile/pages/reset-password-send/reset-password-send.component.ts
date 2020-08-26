import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { UsersService } from '../../../../core/services/users.service';

@Component({
  selector: 'app-reset-password-send',
  templateUrl: './reset-password-send.component.html',
  styleUrls: ['./reset-password-send.component.scss']
})
export class ResetPasswordSendComponent implements OnInit {
  isLoading = false;
  isError = false;
  errorMessage = 'Request is fial, please try leter';
  userEmail = new FormControl('', [Validators.email, Validators.required]);
  isSuccess = false;

  constructor(private service: UsersService) {  }

  ngOnInit(): void { }

  handleSubmitForm() {
    this.isLoading = true;
    if (!this.userEmail.invalid) {
      // console.log(this.userEmail.value);
      const url = window.location.origin + window.location.pathname;
      this.service.forgotPassword(this.userEmail.value, url).toPromise().then(result => {
        console.log(result);
        this.isSuccess = true;
        this.isLoading = false;
      }).catch(err => {
        console.log(err);
        this.isError = true;
        this.isLoading = false;
      });
    }
  }

}
