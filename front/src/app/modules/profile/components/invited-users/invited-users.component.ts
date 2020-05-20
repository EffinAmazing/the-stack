import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UsersService } from '../../../../core/services/users.service';

@Component({
  selector: 'app-invited-users',
  templateUrl: './invited-users.component.html',
  styleUrls: ['./invited-users.component.scss']
})
export class InvitedUsersComponent  {
  users: Array<any>;
  displayedColumns: Array<string>;
  sendingInvite: boolean;
  inviteSended: string;

  constructor(
    public dialogRef: MatDialogRef<InvitedUsersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { blueprint: any },
    private service: UsersService) {
      this.users = [];
      this.displayedColumns = ['email', 'firstName', 'lastName', 'verified', 'actions'];
      this.service.getInvitedUsers(this.data.blueprint.id).subscribe(res => {
        this.users = res;
      });
      this.inviteSended = '';
      this.sendingInvite = false;
    }


  onNoClick(): void {
    this.dialogRef.close();
  }

  handleResendInvite(userItem) {
    this.sendingInvite = true;
    this.service.resendInvite(userItem.id).toPromise().then(res => {
       this.inviteSended = userItem.id;
       this.sendingInvite = false;

       setTimeout(() => {
        this.inviteSended = '';
       }, 5000);
    });

  }

}
