import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { SocialShareService } from '../../../../core/services/social-share.service';
import { UploadImagesService } from '../../../../core/services/upload-images.service';
import { ActionHistoryService } from '../../../../core/services/action-history.service';
import { Tool, BluePrintTool, BluePrint } from '../../../../shared/models/tool';
import { User } from '../../../../shared/models/users';
import { Pointer } from '../../../../shared/models/general';
import { MatDialog } from '@angular/material/dialog';
import { DeleteStackDialogComponent } from '../../components/delete-stack-dialog/delete-stack-dialog.component';
import { CreateNewStackDialogComponent } from '../../components/create-new-stack-dialog/create-new-stack-dialog.component';
import { InfoPopupDialogComponent } from '../../components/info-popup-dialog/info-popup-dialog.component';
import { AddNewToolDialogComponent } from '../../components/add-new-tool-dialog/add-new-tool-dialog.component';
import { InviteDialogComponent } from '../../components/invite-dialog/invite-dialog.component';
import { CreateCustomToolDialogComponent } from '../../components/create-custom-tool-dialog/create-custom-tool-dialog.component';
import { Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { forbiddenTags, hiddenCategories } from '../../../../core/config';
import { AuthService } from '../../../../core/services/auth.service';
import { SignupSigninPopupComponent } from '../../../../shared/components/signup-signin-popup/signup-signin-popup.component';
import html2canvas from 'html2canvas';
import * as d3 from 'd3';
import { environment } from 'src/environments/environment';
import { DrawArrow } from 'src/app/shared/models/draws-item';



@Component({
  selector: 'app-build-stack',
  templateUrl: './build-stack.component.html',
  styleUrls: ['./build-stack.component.scss']
})
export class BuildStackComponent implements OnInit {
  @ViewChild('categoriesList') categoriesList: ElementRef;
  id: string | null = null;
  blueprint: BluePrint;
  nodes: BluePrintTool[] = [];
  nodesList: string[] = [];
  showNodes: BluePrintTool[] = [];
  categories: any = { 'None': [] };
  changedNodes$: BehaviorSubject<any> = new BehaviorSubject({});
  changedArrows$: BehaviorSubject<any> = new BehaviorSubject([]);
  changedCategories$: BehaviorSubject<any> = new BehaviorSubject({});
  changeNodeData$: BehaviorSubject<BluePrintTool | null> = new BehaviorSubject(null);
  addedNewNode$: BehaviorSubject<BluePrintTool[] | null> = new BehaviorSubject(null);
  toggleMultiSelect$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  nodesForUpdate: any = [];
  selectedArrow: DrawArrow;
  hideList = true;
  loaded = false;
  domain = '';
  isError = false;
  isWaiting = false;
  errMessage = 'Something went wrong plaese check domain and try again';
  isMultiSelectActive = false;
  authUser: User;


  constructor(
      private service: BlueprintsService,
      private route: ActivatedRoute,
      private router: Router,
      private social: SocialShareService,
      private auth: AuthService,
      public history: ActionHistoryService,
      private upload: UploadImagesService,
      public deleteDialog: MatDialog,
      public toolsDialog: MatDialog,
      public infoDialog: MatDialog,
      public inviteDialog: MatDialog,
      public customToolDialog: MatDialog,
      public showRegisterDialog: MatDialog) {
    this.id = route.snapshot.params['id'];
    console.log(this.id);
    this.route.queryParams.subscribe((params: any) => {
      this.domain = params.domain;
      // console.log(params);
      window['dataLayer'] = window['dataLayer'] || [];
      this.authUser = this.auth.getCurrentUser();
      console.log(this.authUser);
    });
  }

  ngOnInit(): void {
    if (this.domain) {
      this.service.getDomainTools(this.domain).subscribe((data) => {
        this.proceedBluePrintData(data);
        // console.log(this.nodes, this.nodes.length);
      }, err => this.isError = true );
    } else if (this.id) {
      this.service.getBlueprint(this.id).subscribe((data) => {
        this.proceedBluePrintData(data);
      }, err => this.isError = true );
    } else {
      this.isError = true;
    }
  }

  private proceedBluePrintData(data) {
    if (typeof data === 'string') {
      return this.isError = true;
    }
    console.log(data);
    let hidden = 0;
    this.blueprint = data.blueprint;
    data.nodes.forEach((item) => {
      if (item.toolId) {
        const tool = data.tools.find((atool) =>  atool.id === item.toolId );
        item.tool = tool;
        this.nodes[item.id] = item;
        this.nodesList.push(item.id);
        if (item.hide ) { hidden++; }
        if ( item.tool.categories && item.tool.categories.length > 0) {
          item.tool.categories.forEach((cat) => {
            if (this.categories[cat]) {
              this.categories[cat].push(item.id);
            } else {
              this.categories[cat] = [ item.id ];
            }
          });
        } else {
          this.categories['None'].push(item.id);
        }
      }
      /* */
    });

    if (data.nodes.length - hidden > 10 && hidden === 0) {
      this.proceedNodes(data.nodes.length, hidden);
    } else {
      this.completedProceedNodes();
    }
  }

  private proceedNodes(all, hidden, force?) {

    if (force) {
      this.nodesList.forEach((nodeId) => {
        const item = this.nodes[nodeId];
        if (!item.hide && all - hidden > 50 ) {

          if (item.tool.name !== this.domain) {
            item.hide = true;
            hidden++;
            this.nodesForUpdate.push(item.id);
          }
        }
      });

      this.completedProceedNodes();
    } else {
      this.nodesList.forEach((nodeId) => {
        const item = this.nodes[nodeId];
        //
        let oldTool = false;
        if (item.end) {
          const endDate = new Date(item.end);
          const diff = Date.now() - endDate.getTime();
          if (diff > 7776000000) {
            oldTool = true;
          }
        }
        if (!item.hide && ( this.verifyOrderToHide(item.tool.categories) || forbiddenTags.includes(item.tool.tag) || oldTool ) &&
        ( item.tool.tag !== 'analytics' || oldTool) && all - hidden > 10) {
          item.hide = true;
          this.nodesForUpdate.push(item.id);
          hidden++;
        }
      });

      if (all - hidden <= 50) {
        this.completedProceedNodes();
      } else {
        console.log('force');
        this.proceedNodes(all, hidden, true);
      }
    }
  }

  public getAssetsFolder() {
    if (typeof window['assets'] !== 'undefined') {
      return window['assets'];
    } else {
      return '/';
    }
  }

  public handleNextAction() {
    this.history.nextAction(this.blueprint.id);
  }

  public handlePrevAction() {
    this.history.prevAction(this.blueprint.id);
  }

  showPopupFoSignUp() {
    const dialogRef = this.showRegisterDialog.open(SignupSigninPopupComponent, {
      width: '640px',
      data: { blueprint: this.blueprint }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  public handleUpdatedNodeData(result) {
    // console.log(result);
    if (result.data) {
      if (this.authUser) {
        window['dataLayer'].push({
          event: 'stackbuilder.node.updateInfo',
          node:  this.nodes[result.nodeId],
          tool: this.nodes[result.nodeId].tool
        });


        this.service.updateNodeTool(result.nodeId, result.data, this.blueprint.id).subscribe((res) => {
          const tool = this.nodes[result.nodeId].tool;
          res.tool = this.nodes[result.nodeId].tool;
          this.nodes[result.nodeId] = res;
          // console.log(result.data, res);
          this.changeNodeData$.next(this.nodes[result.nodeId]);
        });
      } else {
        this.showPopupFoSignUp();
      }
    }
  }

  public handleClickInfo() {
    const dialogRef = this.deleteDialog.open(InfoPopupDialogComponent, {
      width: '570px',
      data: { domain: this.blueprint.domain }
    });

    dialogRef.afterClosed().subscribe(result => {  });
  }

  public handleShare(media) {
    const width = 500;
    const height = 300;
    const left = (screen.width / 2) - (width / 2);
    const top = (screen.height / 2) - (height / 2);
    const popup = window.open('', '_blank',
      `menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=${width},height=${height},top=${top},left=${left}`);
    this.social.prepareContent(popup);
    this.isWaiting = true;
    html2canvas(document.querySelector('#stackWorkflow'), {
      backgroundColor: '#ffffff',
      logging: true,
      allowTaint: true, useCORS: true}).then((canvas) => {
        canvas.toBlob((blob) => {
          const formData = new FormData();
          formData.append('image', blob, 'filename.jpg');
          /*  */

          this.upload.uploadImgFor(this.blueprint.id, formData).toPromise().then((link) => {

            switch (media) {
              case 'facebook':
                this.social.shareInFaceBook('', environment.serverURI + link, popup);
                break;
              case 'twitter':
                this.social.shareInTwitter(environment.serverURI + link, popup);
                break;
              case 'linkedin':
                this.social.shareInLinkedIn(environment.serverURI + link, this.blueprint.domain + ' tools stack', popup);
                break;
              case 'email':
                this.social.shareInEmail(environment.serverURI + link, popup, this.blueprint.domain);
                break;
              default:
                break;
            }


            window['dataLayer'].push({
              event: 'stackbuilder.shared',
              social: media,
              domain: this.blueprint.domain
            });

            this.isWaiting = false;
          }).catch(err => console.log(err));
        }, 'image/jpeg');
      });

  }

  public parsePrice(price: number): string {
    if (price >= 1000) {
      const tPrice = Math.floor(price / 1000);

      return (tPrice ? (tPrice + ', ') : ' ') + (price - tPrice * 1000);
    } else {
      return price.toString();
    }
  }

  private verifyOrderToHide(categories) {
    if (!categories) {
      return true;
    } else {
      let hide = false;
      if (categories.length === 0 ) { return true; }
      categories.forEach((cat) => {
        if ( hiddenCategories.includes(cat) ) {
          hide = true;
        }
      });

      return hide;
    }
  }

  public handleSlectArrow(data) {
    this.selectedArrow = data;
  }

  public handleRemoveArrow() {
    if (this.selectedArrow) {
      this.deleteArrowDots();
      this.history.addAction(this.blueprint.id, { name: 'removeArrow', data: this.selectedArrow });
      const lineId = this.selectedArrow.lineId;

      window['dataLayer'].push({
        event: 'stackbuilder.node.disconnected',
        parentTool:  this.nodes[this.selectedArrow.start.nodeId].tool,
        childTool: this.nodes[this.selectedArrow.end.nodeId].tool,
        stack: this.blueprint
      });

      this.handleRemoveArrows([lineId], true);
      document.querySelector(`path#${lineId}`).remove();
      this.selectedArrow = null;
    }
  }

  public updatedNodePosiotion(data) {
    // console.log('aaa', data);
    const oldPosition = this.nodes[data.nodeId].position;
    if (!data.disableHistory) {

      this.history.addAction(this.blueprint.id, { name: 'updatePosition', data: {
        nodeId: data.nodeId,
        newPosition: data.position,
        oldPosition }
      });
    }
    window['dataLayer'].push({
      event: 'stackbuilder.node.updatePosition',
      node:  this.nodes[data.nodeId],
      newPosition: data.position,
      oldPosition,
      tool: this.nodes[data.nodeId].tool
    });

    this.service.updateNodeTool(data.nodeId, { position: data.position }, this.blueprint.id).subscribe((res) => {
      const tool = this.nodes[data.nodeId].tool;
      res.tool = this.nodes[data.nodeId].tool;
      this.nodes[data.nodeId] = res;
    });
  }

  public handleCloseTools() {
    this.hideList = true;
  }

  private completedProceedNodes() {

    this.loaded = true;
    if (this.nodesForUpdate.length) {
      this.service.hideNodes(this.nodesForUpdate).subscribe((data) => {
        this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList });
        this.changedCategories$.next( this.categories );
        this.getArrowsList();
      });
    } else {
      this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList });
      this.changedCategories$.next( this.categories );
      this.getArrowsList();
    }
  }

  private getArrowsList() {

    if (this.blueprint.id) {
      this.service.getArrows(this.blueprint.id).toPromise().then((data) => {
        this.changedArrows$.next(data);
      }).catch((err) => { console.log(err); });
    }
  }

  public handleDeselectArrow() {
    document.querySelector(`path#${this.selectedArrow.lineId}`).setAttribute('stroke-width', '2');
    this.deleteArrowDots();
    this.selectedArrow = null;
  }

  public deleteArrowDots() {
    if (this.selectedArrow) {
      const dot1 = document.querySelector(`#dot-${this.selectedArrow.start.nodeId}`);
      if (dot1) { dot1.remove(); }
      const dot2 = document.querySelector(`#dot-${this.selectedArrow.end.nodeId}`);
      if (dot2) { dot2.remove(); }
    }
  }

  public handleClickInviteUser() {
    if (this.authUser) {
      const dialogRef = this.inviteDialog.open(InviteDialogComponent, {
        width: '520px',
        data: { blueprintId: this.blueprint.id }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(result);
        if (result) {
          window['dataLayer'].push({
            event: 'stackbuilder.invite',
            email: result.emails.join(',')
          });
          this.service.inviteUsers(result).toPromise()
          .then(res => {
            console.log(res);
          })
          .catch(err => {
            console.log(err);
          });
        }
      });
    } else {
      this.showPopupFoSignUp();
    }
  }

  public handleCeateCustomTool(node: BluePrintTool | void) {
    const dialogRef = this.customToolDialog.open(CreateCustomToolDialogComponent, {
      width: '620px',
      data: {
        node,
        blueprintId: this.blueprint.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if ( result ) {
        if (!node) {
          this.addedNewNode$.next([ result ]);
        } else {
          this.nodes[node.id] = result;
          this.changeNodeData$.next(this.nodes[node.id]);
        }
      }
    });
  }

  public handleEditCustomTool(id: string) {
    const node = this.nodes[id];
    this.handleCeateCustomTool(node);
  }

  public handleAddNewTool() {
    const dialogRef = this.deleteDialog.open(AddNewToolDialogComponent, {
      width: '620px',
      data: { blueprintId: this.blueprint.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      const listToCreate = [];
      const listToUnhide = [];
      if (result) {
        if (typeof result === 'object') {
          for (const key in result) {
            if (result.hasOwnProperty(key)) {
              if (!result[key].nodeId) {
                listToCreate.push({
                    blueprintId: this.blueprint.id,
                    toolId: result[key].id,
                    hide: false,
                    dependencies: []
                });
              } else {
                listToUnhide.push(result[key].nodeId);
              }
            }
          }

          this.proceedAddNewNodes(listToCreate, listToUnhide, result).then(nodes => {
            if (nodes.length) {
              this.addedNewNode$.next(nodes);
            }
          }).catch(err => console.log(err));


        } else if (typeof result === 'string' && result === 'create') {
          this.handleCeateCustomTool();
        }
        /*if (listToCreate.length > 0) {
          this.service.addNewNodeItems(listToCreate).toPromise().then(nodes => {
            const nodesIds: string[] = [];
            nodes.map((node) => {
              node.tool = result[node.toolId];
              nodesIds.push(node.id);
              this.nodes[node.id] = node;
              return node;
            });
            this.nodesList = [...this.nodesList, ...nodesIds];
            this.addedNewNode$.next(nodes);
            // this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList  });
          }).catch(err => {
            console.log(err);
          });
        }

        if (listToUnhide.length > 0) {
          this.service.unhideNodes(listToUnhide).toPromise()
            .then(res => {
              const nodes = listToUnhide.map((nodeId) => {
                this.nodes[nodeId].hide = false;
                return this.nodes[nodeId];
              });

              this.addedNewNode$.next(nodes);
            })
            .catch(err => console.log(err));
        }*/
      }
    });
  }

  async proceedAddNewNodes(listToCreate, listToUnhide, tools) {
    let nodes = [];
    let unhideNodes = [];
    if (listToCreate.length) {
      nodes = await this.service.addNewNodeItems(listToCreate).toPromise();
      // console.log(nodes);
      const nodesIds: string[] = [];
      nodes.map((node) => {
        node.tool = tools[node.toolId];
        nodesIds.push(node.id);
        this.nodes[node.id] = node;

        window['dataLayer'].push({
          event: 'stackbuilder.node.added',
          node,
          tool: tools[node.toolId],
          stack: this.blueprint
        });

        return node;
      });
      this.nodesList = [...this.nodesList, ...nodesIds];
    }

    if (listToUnhide.length) {
      const res = await this.service.unhideNodes(listToUnhide).toPromise();
      unhideNodes = listToUnhide.map((nodeId) => {
        this.nodes[nodeId].hide = false;
        window['dataLayer'].push({
          event: 'stackbuilder.node.added',
          node: this.nodes[nodeId],
          tool: this.nodes[nodeId].tool,
          stack: this.blueprint
        });
        return this.nodes[nodeId];
      });
      console.log(unhideNodes, res);
    }

    return [...nodes, ...unhideNodes];
  }

  public handleRemoveArrows(ids, blockReload?: any ) {
    this.deleteArrowDots();
    this.selectedArrow = null;
    this.service.removeArrows(ids).toPromise().then((result) => {
      if (!blockReload) {
        this.service.getArrows(this.blueprint.id).toPromise().then((data) => {
          this.changedArrows$.next(data);
        }).catch((err) => console.log(err));
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  public moveToHome() {
    this.router.navigateByUrl('/home');
  }

  public handleHideList() {
    this.hideList = !this.hideList;
    this.categoriesList.nativeElement.scrollIntoView({
      behavior: 'smooth'
    });
  }

  public handleHideNodeItem(data: { item: BluePrintTool, disableHistory?: boolean }) {
    if (!data.item.hide) {
      data.item.hide = true;
      window['dataLayer'].push({
        event: 'stackbuilder.node.hide',
        node: data.item,
        tool: data.item.tool,
        stack: this.blueprint
      });
    } else {
      data.item.hide = false;
      window['dataLayer'].push({
        event: 'stackbuilder.node.added',
        node: data.item,
        tool: data.item.tool,
        stack: this.blueprint
      });
    }

    if (!data.disableHistory) {  this.history.addAction(this.blueprint.id, { name: 'hideNode', data }); }

    this.service.updateNodeTool(data.item.id, { hide: data.item.hide }, this.blueprint.id).subscribe((res) => {
      res.tool = this.nodes[data.item.id].tool;
      this.nodes[data.item.id] = res;
      this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList  });
    });
  }

  public handleAddArrow(data) {
    // console.log(data);
    this.history.addAction(this.blueprint.id, { name: 'addArrow', data });
    window['dataLayer'].push({
      event: 'stackbuilder.node.connected',
      parentTool: this.nodes[data.start.nodeId].tool,
      childTool: this.nodes[data.end.nodeId].tool,
      stack: this.blueprint
    });
    this.service.addArrow(this.blueprint.id, data).toPromise().then((result) => {
      // console.log(result);
    }).catch(err => console.log(err));
  }

  public handleUpdateArrow(data) {
    if (!data.disableHistory) {  this.history.addAction(this.blueprint.id, { name: 'updateArrow', data: Object.assign({}, data) }); }
    this.service.updateArrow(data.newData).toPromise().then((result) => { }).catch(err => console.log(err));
  }

  public handleHideNode(data) {
    window['dataLayer'].push({
      event: 'stackbuilder.node.hide',
      node: data.item,
      tool: data.item.tool,
      stack: this.blueprint
    });
    this.history.addAction(this.blueprint.id, { name: 'hideNode', data: data.item });
    this.service.updateNodeTool(data.item.id, { hide: true }, this.blueprint.id).subscribe((res) => {
      res.tool = this.nodes[data.item.id].tool;
      this.nodes[data.item.id] = res;
    });
  }

  public removeStack() {
    const dialogRef = this.deleteDialog.open(DeleteStackDialogComponent, {
      width: '570px',
      data: { domain: this.blueprint.domain }
    });

    dialogRef.afterClosed().subscribe(result => {

      if ( result ) {
        window['dataLayer'].push({
          event: 'stackbuilder.remove',
          stack: this.blueprint
        });
        this.service.removeBluePrint(this.blueprint.id).toPromise().then(() => {
          this.router.navigateByUrl('/home');
        }).catch(err => alert(err));
      }
    });
  }

  public createNewStack() {
    const dialogRef = this.deleteDialog.open(CreateNewStackDialogComponent, {
      width: '570px',
      data: { domain: this.blueprint.domain }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.onSameUrlNavigation = 'reload';
        window['dataLayer'].push({
          event: 'stackbuilder.create',
          domain: result
        });
        this.router.navigateByUrl('/stack/build?domain=' + result, { skipLocationChange: false });
        window.location.href = window.location.origin + window.location.pathname + '#/stack/build?domain=' + result;
        window.location.reload();
      }
    });
  }

  public multiSelectHandler() {
    this.isMultiSelectActive = !this.isMultiSelectActive;
    this.toggleMultiSelect$.next(this.isMultiSelectActive);
  }

  public handleGroupMove(data: { nodeIds: string[], diff: Pointer }) {
    this.history.addAction(this.blueprint.id, { name: 'groupMove', data  });
  }

}
