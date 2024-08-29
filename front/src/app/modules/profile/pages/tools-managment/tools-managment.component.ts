import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { UsersService } from '../../../../core/services/users.service';
import { ToolsService } from '../../../../core/services/tools.service';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmActionComponent } from '../../components/confirm-action/confirm-action.component';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '../../../../../environments/environment';

const host = environment.serverURI;
const timeout = 500;

@Component({
  selector: 'app-tools-managment',
  templateUrl: './tools-managment.component.html',
  styleUrls: ['./tools-managment.component.scss']
})

export class ToolsManagmentComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  user: any;
  tools: Array<any> = [];
  limit = 10;
  total = 0;
  displayedColumns: string[] = ['name','logo','description','hidden'];
  runedTimeout = false;
  toolSearchName = '';
  cachedValue = '';

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    private toolsService: ToolsService,
    public deleteDialog: MatDialog,
    public editDialog: MatDialog,
    public inviteUser: MatDialog,
    private blueprintService: BlueprintsService
  ) {
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

    if (this.toolSearchName) {      
      this.searchTools(offset);
    } else {      
      this.toolsService.getToolsList(offset).toPromise().then(res => {
        this.tools = res.list;
        this.total = res.total;
      }).catch(err => {
        console.log(err);
      });
    }
  }

  public handleInputText(evt) {
    // console.log(evt.data, evt.target.value);
    if (evt.target.value !== '') {
      if (!this.runedTimeout) {
        this.runedTimeout = true;
        setTimeout(() => {
          this.searchTools();
        }, timeout);
      }
    }
  }

  private searchTools(offset = 0) {
    if (this.toolSearchName !== this.cachedValue) {
      this.cachedValue = this.toolSearchName;
      this.runedTimeout = true;
      this.paginator.firstPage();
      setTimeout(() => {
        this.runedTimeout = false;
        this.searchTools(offset);
      }, timeout);
    } else {
      this.runedTimeout = false;
      console.log(this.toolSearchName);
      //this.showSpinner = true;
      //this.transparentListOfTools = true;
      this.toolsService.searchToolsList(this.toolSearchName, offset).toPromise().then((res) => {

        this.tools = res.list;
        this.total = res.total;

        

        //this.tools = this.parseResults(result);
        //console.log(this.tools);
        //this.toolsDataLoaded = true;
        //this.showSpinner = false;
        //this.transparentListOfTools = false;
      }).catch(err => {
        //console.log(err);
        //this.showSpinner = false;
        //this.transparentListOfTools = false;
      });
    }
  }



  public handleShowHideGlobally(item) {
    var hideTool = false;
    if (item.hidden === undefined || item.hidden === false) {
      hideTool = true;
    } else if (item.hidden === true) {
      hideTool = false;
    }

    this.blueprintService.updateToolVisibility({tool: item}, hideTool).subscribe((res) => {
        //update tool item in the tools array
      let tool = this.tools.find(tool => tool.id == item.id);
      if (tool) tool.hidden = res.hidden;
    });    
  }


  public processImageSrc(link) {
    if (!link) return "";
    
    if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1 ) {
      return link;
    } else {
      return host + link;
    }
  }

  ngOnInit(): void {
    this.toolsService.getToolsList(0).toPromise().then(res => {
      console.log(res);
      this.tools = res.list;
      this.total = res.total;
    }).catch(err => {
      console.log(err);
    });
  }

}
