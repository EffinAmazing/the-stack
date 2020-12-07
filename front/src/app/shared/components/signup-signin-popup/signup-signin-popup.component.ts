import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';
import { Router } from '@angular/router';
import { BlueprintsService } from '../../../core/services/blueprints.service';

@Component({
  selector: 'app-signup-signin-popup',
  templateUrl: './signup-signin-popup.component.html',
  styleUrls: ['./signup-signin-popup.component.scss']
})
export class SignupSigninPopupComponent {
  formActive: 'signin' | 'signup';
  signUpFormGroup: FormGroup;
  signInFormGroup: FormGroup;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  allowResetPassword = false;

  constructor(
    public dialogRef: MatDialogRef<SignupSigninPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private auth: AuthService,
    private userService: UsersService,
    private router: Router,
    private stackService: BlueprintsService
  ) {
    console.log('dialogRef', this.data);
    this.formActive = this.data.form && this.data.form === 'signin' ? 'signin' : 'signup';
    console.log('this.formActive', this.formActive);
    this.signUpFormGroup = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.min(8), Validators.required]),
      repeatPassword: new FormControl('', [Validators.min(8), this.matchPassValidator, Validators.required])
    } );

    this.signInFormGroup = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.min(8), Validators.required]),
    });

    this.isLoading = false;
    this.isError = false;
    this.errorMessage = '';
  }

  onClickClose(): void {
    this.dialogRef.close();
  }

  toggleForms() {
    if (this.formActive === 'signup') {
      this.formActive = 'signin';
    } else {
      this.formActive = 'signup';
    }
  }

  onClose() {
    this.dialogRef.close();
  }

  addUserToStack() {
    this.stackService.signUserToBluePrint(this.data.blueprint.id).toPromise()
      .then(res => {
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl('/stack/build/' + res.id, { skipLocationChange: false });
        this.dialogRef.close();
      })
      .catch(err => {
        this.isError = true;
        this.errorMessage = 'Fail to add User to Stack';
        console.log(err);
      });
  }

  loginIn(data) {
    window['requestToSignIn'] = true;

    this.auth.login(data.email, data.password).toPromise().then(res => {
      this.isLoading = false;
      if (res === 'Error') {
        this.isError = true;
        this.errorMessage = 'Fail to sigin User, try again';
        this.formActive = 'signin';
      } else {
        this.auth.setSession(res);
        this.addUserToStack();
        /* */
      }
    }).catch(err => {
      console.log(err);
      this.isError = true;
      this.isLoading = false;
      this.errorMessage = 'Fail to sigin User, try again';
      this.formActive = 'signin';
      // this.router.onSameUrlNavigation = 'reload';
      // this.router.navigateByUrl('/profile/signin', { skipLocationChange: false });
    });
  }

  handleSubmitSiginIn() {
    if (!this.signInFormGroup.invalid) {
      this.isLoading = true;
      const data = this.signInFormGroup.value;
      this.loginIn(data);
    }
  }

  handleSubmitSignUp() {
    // this.signUpFormGroup.che
    if (!this.signUpFormGroup.invalid) {
      const data = this.signUpFormGroup.value;

      this.userService.createUser(data).toPromise().then(res => {
        console.log(res);

        window['dataLayer'].push({
          event: 'stackbuilder.signup',
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName
        });
        this.loginIn(data);
      }).catch((err) => {
        this.isLoading = false;
        this.isError = true;
        let message = '';
        if (err.error.type === 'EmailDuplication') {
          message = ' User with this email is already created';
          this.allowResetPassword = true;
        }
        this.errorMessage = 'Fail to sign up User. ' + message;
        console.log(err, err.data);
      });
    } else {
      this.sfEmail.markAsTouched();
      this.sfFirstName.markAsTouched();
      this.sfLastName.markAsTouched();
      this.sfPassword.markAsTouched();
      this.sfRepeatPassword.markAsTouched();
    }
  }

  matchPassValidator(control: AbstractControl) : { passMatch: boolean } | null {
    if (control.parent) { 
      console.log(control, control.parent);
      let sfPassword = control.parent.get('password');
      let password = sfPassword.value;
      if (control.value !== password) {
        return { passMatch: true };
      }
    }

    return null;
  }

  // Sign Up form gorup fields
  get sfEmail():AbstractControl { return this.signUpFormGroup.get('email'); }
  get sfFirstName():AbstractControl { return this.signUpFormGroup.get('firstName'); }
  get sfLastName():AbstractControl { return this.signUpFormGroup.get('lastName'); }
  get sfPassword():AbstractControl { return this.signUpFormGroup.get('password'); }
  get sfRepeatPassword(): AbstractControl { return this.signUpFormGroup.get('repeatPassword'); }

  // Sign In form group fields
  get lfEmail():AbstractControl {  return this.signInFormGroup.get('email'); }
  get lfPassword():AbstractControl {  return this.signInFormGroup.get('password'); }
}
