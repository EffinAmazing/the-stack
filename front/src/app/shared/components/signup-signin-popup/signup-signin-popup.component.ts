import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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

  constructor(
    public dialogRef: MatDialogRef<SignupSigninPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private auth: AuthService,
    private userService: UsersService,
    private router: Router,
    private stackService: BlueprintsService
  ) {
    this.formActive = 'signup';
    this.signUpFormGroup = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      password: new FormControl('', [Validators.min(8), Validators.required]),
      repeatPassword: new FormControl('', Validators.min(8))
    });

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

  addUserToStack() {
    this.stackService.signUserToBluePrint(this.data.blueprint.id).toPromise()
      .then(res => {
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl('/stack/build/' + this.data.blueprint.id, { skipLocationChange: false });
        this.dialogRef.close();
      })
      .catch(err => {
        this.isError = true;
        this.errorMessage = 'Fail to add User to Stack';
        console.log(err);
      });
  }

  loginIn(data) {
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
    this.isLoading = true;
    if (!this.signInFormGroup.invalid) {
      const data = this.signInFormGroup.value;
      this.loginIn(data);
    }
  }

  handleSubmitSignUp() {
    if (!this.signUpFormGroup.invalid) {
      const data = this.signUpFormGroup.value;

      this.userService.createUser(data).toPromise().then(res => {
        console.log(res);
        this.loginIn(data);
      }).catch((err) => {
        this.isLoading = false;
        this.isError = true;
        this.errorMessage = 'Fail to sign up User, try again';
        console.log(err, err.data);
      });
    }
  }
}
