import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../../core/services/auth.service";
import { BlueprintsService } from "../../../../core/services/blueprints.service";
import { BluePrint } from "../../../../shared/models/tool";
import { DeleteStackDialogComponent } from "../../../blueprint/components/delete-stack-dialog/delete-stack-dialog.component";
import { ProgressBarMode } from "@angular/material/progress-bar";
import { FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { environment } from "../../../../../environments/environment";
import { MatDialog } from "@angular/material/dialog";
import { InvitedUsersComponent } from "../../components/invited-users/invited-users.component";

@Component({
  selector: "app-account",
  templateUrl: "./account.component.html",
  styleUrls: ["./account.component.scss"]
})
export class AccountComponent implements OnInit {
  user: any;
  listBluePrints: BluePrint[] = [];
  domain = new FormControl("", [
    Validators.pattern(/^([a-z.\-]+(\.)[a-z]{2,3})$/i)
  ]);
  loadingBluePrints = true;
  loadingSharedStacks = true;
  sharedBluePrints: BluePrint[] = [];
  modeName: ProgressBarMode = "indeterminate";
  showAddStackForm = false;
  submitingDomain = false;

  constructor(
    private auth: AuthService,
    public deleteDialog: MatDialog,
    public invitedDialog: MatDialog,
    private blueprints: BlueprintsService,
    private router: Router
  ) {
    this.user = this.auth.getCurrentUser();
    window["dataLayer"] = window["dataLayer"] || [];
  }

  getDomainLogo(domain: string): string {
    return environment.serverURI + "/domain-logos/" + domain + ".png";
  }

  ngOnInit(): void {
    console.log(this.user);
    this.blueprints
      .getBluePrintsForUser(this.user._id)
      .toPromise()
      .then((res) => {
        this.listBluePrints = res;
        this.loadingBluePrints = false;
        // console.log(res);
      })
      .catch((err) => {
        this.loadingBluePrints = false;
        console.log(err);
      });

    this.blueprints
      .getSharedBluePrints()
      .toPromise()
      .then((result) => {
        this.sharedBluePrints = result;
        this.loadingSharedStacks = false;
      })
      .catch((err) => {
        this.loadingSharedStacks = false;
        console.log(err);
      });
  }

  clickShowInvited(blueprint) {
    const dialogRef = this.invitedDialog.open(InvitedUsersComponent, {
      width: "820px",
      data: { blueprint }
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
    });
  }

  submitDomain() {
    if (!this.domain.invalid) {
      // this.router.navigateByUrl('/blueprints/build?domain=' + this.domain.value);
      this.submitingDomain = true;
      this.blueprints
        .postDomainTools(this.domain.value)
        .toPromise()
        .then((result) => {
          this.router.navigateByUrl("/blueprints/build/" + result.blueprint.id);
          this.submitingDomain = false;
        })
        .catch((err) => {
          console.log(err);
          this.submitingDomain = false;
        });
    }
  }

  handleDeleteClick(stack) {
    // this.blueprints.removeBluePrint(id)
    const dialogRef = this.deleteDialog.open(DeleteStackDialogComponent, {
      width: "570px",
      data: { domain: stack.domain }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        window["dataLayer"].push({
          event: "stack.remove",
          stack
        });
        this.blueprints
          .removeBluePrint(stack.id)
          .toPromise()
          .then(() => {
            this.loadingBluePrints = true;

            this.blueprints
              .getBluePrintsForUser(this.user._id)
              .toPromise()
              .then((res) => {
                this.listBluePrints = res;
                this.loadingBluePrints = false;
                // console.log(res);
              })
              .catch((err) => {
                this.loadingBluePrints = false;
                console.log(err);
              });
          })
          .catch((err) => alert(err));
      }
    });
  }

  showFormAddStack() {
    console.log(" *** showFormAddStack *** ");
    this.showAddStackForm = true;
  }

  hideFormAddStack() {
    console.log(" *** hideFormAddStack *** ");
    this.showAddStackForm = false;
  }

  handleInput(data) {
    let value = data.target.value;
    if (value) {
      value = value.replace("https://", "");
      value = value.replace("http://", "");
      const arr = value.split("/");
      value = arr[0].toLowerCase();
      data.target.value = value;
      this.domain.setValue(value);
    }
  }
}
