import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { BluePrint } from '../../../../shared/models/tool';
import { ProgressBarMode } from '@angular/material/progress-bar';
import {FormControl, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  user: any;
  listBluePrints: BluePrint[] = [];
  domain = new FormControl('', [Validators.pattern(/^([a-z.\-]+(\.)[a-z]{2,3})$/i)]);
  loadingBluePrints = true;
  loadingSharedStacks = true;
  sharedBluePrints: BluePrint[] = []
  modeName: ProgressBarMode = 'indeterminate';

  constructor(
    private auth: AuthService,
    private blueprints: BlueprintsService,
    private router: Router ) {
    this.user = this.auth.getCurrentUser();
  }

  getDomainLogo(domain: string): string {
    return environment.serverURI + '/domain-logos/' + domain + '.png';
  }

  ngOnInit(): void {
    console.log(this.user);
    this.blueprints.getBluePrintsForUser(this.user._id).toPromise().then((res) => {
      this.listBluePrints = res;
      this.loadingBluePrints = false;
      // console.log(res);
    }).catch(err => {
      this.loadingBluePrints = false;
      console.log(err);
    });

    this.blueprints.getSharedBluePrints().toPromise()
      .then(result => {
        this.sharedBluePrints = result;
        this.loadingSharedStacks = false;
      })
      .catch(err => {
        this.loadingSharedStacks = false;
        console.log(err);
      });
  }

  submitDomain() {
    if (!this.domain.invalid) {
      // this.router.navigateByUrl('/blueprints/build?domain=' + this.domain.value);
      this.blueprints.postDomainTools(this.domain.value).toPromise().then((result) => {
        this.router.navigateByUrl('/blueprints/build/' + result.blueprint.id);
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  handleInput(data) {
    let value = data.target.value;
    if (value) {
      value = value.replace('https://', '');
      value = value.replace('http://', '');
      const arr = value.split('/');
      value = arr[0];
      data.target.value = value;
      this.domain.setValue( value );
    }
  }

}
