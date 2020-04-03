import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { SignUPFormData } from '../../../../shared/models/users';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss']
})
export class SignupFormComponent implements OnInit {
  @Output() submitForm: EventEmitter<SignUPFormData> = new EventEmitter();
  signUp: FormGroup;

  constructor() {
    this.signUp = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.min(8), Validators.required]),
      repeatPassword: new FormControl('', Validators.min(8))
    });
  }

  ngOnInit(): void {

  }

  public handleSubmitForm() {
    const value = this.signUp.value;

    if (!this.signUp.invalid) {
      const data: SignUPFormData = {
        email: value.email,
        firstName: value.firstName,
        lastName: value.lastName,
        password: value.password
      };

      this.submitForm.emit(data);
    }
  }

}
