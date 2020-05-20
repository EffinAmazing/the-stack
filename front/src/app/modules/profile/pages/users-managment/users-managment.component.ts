import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { UsersService } from '../../../../core/services/users.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmActionComponent } from '../../components/confirm-action/confirm-action.component';
import { UpdateUserFormComponent } from '../../components/update-user-form/update-user-form.component';

@Component({
  selector: 'app-users-managment',
  templateUrl: './users-managment.component.html',
  styleUrls: ['./users-managment.component.scss']
})
export class UsersManagmentComponent implements OnInit {
  user: any;
  users: Array<any> = [];
  limit = 10;
  total = 0;
  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'role', 'verified', 'actions'];

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    public deleteDialog: MatDialog,
    public editDialog: MatDialog) {
    this.user = this.auth.getCurrentUser();
  }

  getRoleName(roleId): string {
    switch (roleId) {
      case 0:
        return 'Administrator';
      case 1:
        return 'Editor';
    }
  }

  handlePage(evnt) {
    console.log(evnt);
    const offset = evnt.pageIndex * this.limit;
    this.usersService.getUsersList(offset).toPromise().then(res => {
      this.users = res.list;
      this.total = res.total;
    }).catch(err => {
      console.log(err);
    });
  }

  handleClickDelete(user) {
    const dialogRef = this.deleteDialog.open(ConfirmActionComponent, {
      width: '512px',
      data: { name: 'Delete User',
        message: `Do you really want to delete user - ${user.firstName ? user.firstName : ''} ${user.lastName ? user.lastName : ''}` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.usersService.deleteUser(user.id).toPromise().then((done) => {
          console.log(done);
          this.usersService.getUsersList(0).toPromise().then(res => {
            this.users = res.list;
            this.total = res.total;
          }).catch(err => {
            console.log(err);
          });
        }).catch(err => {
          console.log(err);
        });
      }
    });
  }

  handleClickEdit(user) {
    const dialogRef = this.editDialog.open(UpdateUserFormComponent, {
      width: '640px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        console.log(data);
        this.usersService.updateUsers(user.id, data).toPromise()
        .then(done => {
          this.usersService.getUsersList(0).toPromise().then(res => {
            this.users = res.list;
            this.total = res.total;
          }).catch(err => {
            console.log(err);
          });
        })
        .catch(err => {
          console.log(err);
        });
      }
    });
  }

  ngOnInit(): void {
    this.usersService.getUsersList(0).toPromise().then(res => {
      console.log(res);
      this.users = res.list;
      this.total = res.total;
    }).catch(err => {
      console.log(err);
    });
  }

}
