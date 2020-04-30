import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { SignInFromData } from '../../../../shared/models/users';

@Component({
  selector: 'app-signin-form',
  templateUrl: './signin-form.component.html',
  styleUrls: ['./signin-form.component.scss']
})
export class SigninFormComponent implements OnInit {
  @Output() submitForm: EventEmitter<SignInFromData> = new EventEmitter();
  signIn: FormGroup;

  constructor() { 
    this.signIn = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.min(8), Validators.required]),
    });
  }


  ngOnInit(): void {
    
  }

  public handleSubmitForm() {
    const value = this.signIn.value;

    if (!this.signIn.invalid) {
      const data: SignInFromData = {
        email: value.email,
        password: value.password
      };

      this.submitForm.emit(data);
    }

  }

}
