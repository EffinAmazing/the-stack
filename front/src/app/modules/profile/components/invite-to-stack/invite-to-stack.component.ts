import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UsersService } from '../../../../core/services/users.service';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-invite-to-stack',
  templateUrl: './invite-to-stack.component.html',
  styleUrls: ['./invite-to-stack.component.scss']
})
export class InviteToStackComponent {
  stacks: any;
  displayedColumns: Array<string>;
  loading: boolean;

  constructor(
    public dialogRef: MatDialogRef<InviteToStackComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any, providerId  },
    private service: UsersService,
    private blueprintService: BlueprintsService
  ) {
    this.displayedColumns = ['logo', 'domain', 'created', 'actions'];
    this.loading = false;
    this.service.getBluePrintByUsers(data.providerId, data.user.id).toPromise().then(res => {
      this.stacks = res;
    }).catch(err => {
      console.log(err);
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  handleInvite(blueprintId) {
    const emails = [ this.data.user.email ];
    const url = window.location.href.replace(window.location.hash, '');
    this.loading = true;

    this.blueprintService.inviteUsers({ emails, url, blueprintId }).toPromise()
      .then(res => {
        this.service.getBluePrintByUsers(this.data.providerId, this.data.user.id).toPromise().then(list => {
          this.stacks = list;
          this.loading = false;
        }).catch(err => {
          this.loading = false;
          console.log(err);
        });
      })
      .catch(err => {
        this.loading = false;
        console.log(err);
      });
  }

  getDomainLogo(domain: string): string {
    return environment.serverURI + '/domain-logos/' + domain + '.png';
  }
}
