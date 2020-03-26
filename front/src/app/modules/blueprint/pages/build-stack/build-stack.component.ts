import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { SocialShareService } from '../../../../core/services/social-share.service';
import { UploadImagesService } from '../../../../core/services/upload-images.service';
import { Tool, BluePrintTool, BluePrint } from '../../../../shared/models/tool';
import { MatDialog } from '@angular/material/dialog';
import { DeleteStackDialogComponent } from '../../components/delete-stack-dialog/delete-stack-dialog.component';
import { CreateNewStackDialogComponent } from '../../components/create-new-stack-dialog/create-new-stack-dialog.component';
import { Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { forbiddenTags, hiddenCategories } from '../../../../core/config';
import html2canvas from 'html2canvas';
import * as d3 from 'd3';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-build-stack',
  templateUrl: './build-stack.component.html',
  styleUrls: ['./build-stack.component.scss']
})
export class BuildStackComponent implements OnInit {
  @ViewChild('categoriesList') categoriesList: ElementRef;
  blueprint: BluePrint;
  nodes: BluePrintTool[] = [];
  nodesList: string[] = [];
  showNodes: BluePrintTool[] = [];
  categories: any = { 'None': [] };
  changedNodes$: BehaviorSubject<any> = new BehaviorSubject({});
  changedArrows$: BehaviorSubject<any> = new BehaviorSubject([]);
  changedCategories$: BehaviorSubject<any> = new BehaviorSubject({});
  nodesForUpdate: any = [];
  selectedArrow: any;
  hideList = true;
  loaded = false;
  domain = '';
  isError = false;
  isWaiting = false;
  errMessage = 'Something went wrong plaese check domain and try again';

  constructor(
      private service: BlueprintsService,
      private route: ActivatedRoute,
      private router: Router,
      private social: SocialShareService,
      private upload: UploadImagesService,
      public deleteDialog: MatDialog) {
    this.route.queryParams.subscribe((params: any) => {
      this.domain = params.domain;
    });
  }

  ngOnInit(): void {
    if (this.domain) {
      this.service.getDomainTools(this.domain).subscribe((data) => {
        if (typeof data === 'string') {
          return this.isError = true;
        }
        console.log(data);
        let hidden = 0;
        this.blueprint = data.blueprint;
        data.nodes.forEach((item) => {
          const tool = data.tools.find((atool) =>  atool.id === item.toolId );
          item.tool = tool;
          this.nodes[item.id] = item;
          this.nodesList.push(item.id);
          if (item.hide ) { hidden++; }
          if (item.tool.categories && item.tool.categories.length > 0) {
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
          /* */
        });

        if (data.nodes.length - hidden > 50) {
          this.proceedNodes(data.nodes.length, hidden);
        } else {
          this.completedProceedNodes();
        }
        // console.log(this.nodes, this.nodes.length);
      }, err => this.isError = true );

    } else {
      this.isError = true;
    }
  }

  private proceedNodes(all, hidden, force?) {

    if (force) {
      this.nodesList.forEach((nodeId) => {
        const item = this.nodes[nodeId];
        if (!item.hide && all - hidden > 50 ) {
          console.log(item.tool);
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
        if (!item.hide && ( this.verifyOrderToHide(item.tool.categories) || forbiddenTags.includes(item.tool.tag)) &&
        item.tool.tag !== 'analytics' && all - hidden > 40) {
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


  public handleUpdatedNodeData(result) {
    // console.log(result);
    if (result.data) {
      this.service.updateNodeTool(result.nodeId, result.data).subscribe((res) => {
        const tool = this.nodes[result.nodeId].tool;
        res.tool = this.nodes[result.nodeId].tool;
        this.nodes[result.nodeId] = res;
      });
    }
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
              default:
                break;
            }

            this.isWaiting = false;
          }).catch(err => console.log(err));
        }, 'image/jpeg');
      });

  }

  public parsePrice(price: number): string {
    const tPrice = Math.floor(price / 1000);

    return (tPrice ? (tPrice + ', ') : ' ') + (price - tPrice * 1000);
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
      console.log(this.selectedArrow);
      const lineId = this.selectedArrow.lineId;
      this.handleRemoveArrows([lineId], true);
      document.querySelector(`path#${lineId}`).remove();
      this.selectedArrow = null;
    }
  }

  public updatedNodePosiotion(data) {
    // console.log('aaa', data);
    this.service.updateNodeTool(data.nodeId, { position: data.position }).subscribe((res) => {
      const tool = this.nodes[data.nodeId].tool;
      res.tool = this.nodes[data.nodeId].tool;
      this.nodes[data.nodeId] = res;
    });
  }

  public handleCloseTools() {
    this.hideList = true;
  }

  private completedProceedNodes() {
    console.log(this.nodesForUpdate);
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

  public handleDeselectArrow(){
    document.querySelector(`path#${this.selectedArrow.lineId}`).setAttribute('stroke-width', '2');
    this.selectedArrow = null;
  }

  public handleRemoveArrows(ids, blockReload?: any ) {
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

  public handleHideNodeItem(data: BluePrintTool) {
    if (!data.hide) {
      data['hide'] = true;
    } else {
      data.hide = false;
    }

    this.service.updateNodeTool(data.id, { hide: data.hide }).subscribe((res) => {
      // const nodeIndex = this.nodes.findIndex((item) => item.id = res.id );
      res.tool = this.nodes[data.id].tool;
      this.nodes[data.id] = res;
      this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList  });
      // this.margeShowNodes();
    });
  }

  public handleAddArrow(data) {
    console.log(data);
    this.service.addArrow(this.blueprint.id, data).toPromise().then((result) => {
      console.log(result);
    }).catch(err => console.log(err));
  }

  public handleUpdateArrow(data) {

    this.service.updateArrow(data).toPromise().then((result) => { }).catch(err => console.log(err));
  }

  public handleHideNode(data) {
    // console.log("handleHideNode", data);
    this.service.updateNodeTool(data.id, { hide: true }).subscribe((res) => {
      res.tool = this.nodes[data.id].tool;
      this.nodes[data.id] = res;
      // console.log('-----------------------updateNodeTool--------------------------------');
      // this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList, hiddenItem: data.id  });
    });
  }

  public removeStack() {
    const dialogRef = this.deleteDialog.open(DeleteStackDialogComponent, {
      width: '320px',
      data: { domain: this.blueprint.domain }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      if ( result ) {
        console.log(this.service);
        this.service.removeBluePrint(this.blueprint.id).toPromise().then(() => {
          this.router.navigateByUrl('/home');
        }).catch(err => alert(err));
      }
    });
  }

  public createNewStack() {
    const dialogRef = this.deleteDialog.open(CreateNewStackDialogComponent, {
      width: '320px',
      data: { domain: this.blueprint.domain }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigateByUrl('/stack/build?domain=' + result, { skipLocationChange: false });
        window.location.href = window.location.origin + window.location.pathname + '#/stack/build?domain=' + result;
        window.location.reload();
      }
    });
  }

  private margeShowNodes() {
    this.showNodes = [];
    this.nodes.forEach((item) => {
      if (!item.hide) {
        this.showNodes.push(item);
      }
    });
  }


}
