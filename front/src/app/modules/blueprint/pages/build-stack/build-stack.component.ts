import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { BlueprintsService } from '../../../../core/services/blueprints.service';
import { SocialShareService } from '../../../../core/services/social-share.service';
import { UploadImagesService } from '../../../../core/services/upload-images.service';
import { ActionHistoryService } from '../../../../core/services/action-history.service';
import { Tool, BluePrintTool, BluePrint } from '../../../../shared/models/tool';
import { User } from '../../../../shared/models/users';
import { Pointer } from '../../../../shared/models/general';
import { MatDialog } from '@angular/material/dialog';
import { ShareUrlDialogComponent } from '../../components/share-url-dialog/share-url-dialog.component';
import { DeleteStackDialogComponent } from '../../components/delete-stack-dialog/delete-stack-dialog.component';
import { CreateNewStackDialogComponent } from '../../components/create-new-stack-dialog/create-new-stack-dialog.component';
import { AdditionalDomainComponent } from '../../components/additional-domain/additional-domain.component';
import { InfoPopupDialogComponent } from '../../components/info-popup-dialog/info-popup-dialog.component';
import { AddNewToolDialogComponent } from '../../components/add-new-tool-dialog/add-new-tool-dialog.component';
import { InviteDialogComponent } from '../../components/invite-dialog/invite-dialog.component';
import { LoadEmptyStackDialogComponent } from '../../components/load-empty-stack-dialog/load-empty-stack-dialog.component';
import { CreateCustomToolDialogComponent } from '../../components/create-custom-tool-dialog/create-custom-tool-dialog.component';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { forbiddenTags, hiddenCategories, forbiddenTools } from '../../../../core/config';
import { AuthService } from '../../../../core/services/auth.service';
import { SignupSigninPopupComponent } from '../../../../shared/components/signup-signin-popup/signup-signin-popup.component';
import { ComponentCanDeactivate } from '../../../../core/guards/component-can-deactivate.guard';
import html2canvas from 'html2canvas';
import * as d3 from 'd3';
import { environment } from 'src/environments/environment';
import { DrawArrow } from 'src/app/shared/models/draws-item';
import { ArrowsHelper } from '../../../../shared/helper/arrows-draw.helper';
import { BuilderComponent } from '../../components/builder/builder.component';

const maxNewVisibleItems = 40;


@Component({
  selector: 'app-build-stack',
  templateUrl: './build-stack.component.html',
  styleUrls: ['./build-stack.component.scss']
})
export class BuildStackComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild('categoriesList') categoriesList: ElementRef;
  @ViewChild(BuilderComponent) builderComponent!: BuilderComponent;
  id: string | null = null;
  blueprint: BluePrint;
  nodes: BluePrintTool[] = [];
  nodesList: string[] = [];
  showNodes: BluePrintTool[] = [];
  globalHiddenTools: Tool[] = [];
  toolsHiddenGlobally$: BehaviorSubject<any> = new BehaviorSubject({});
  categories: any = { 'None': [] };
  changedNodes$: BehaviorSubject<any> = new BehaviorSubject({});
  changedArrows$: BehaviorSubject<any> = new BehaviorSubject([]);
  changedCategories$: BehaviorSubject<any> = new BehaviorSubject({});
  changeNodeData$: BehaviorSubject<BluePrintTool | null> = new BehaviorSubject(null);
  addedNewNode$: BehaviorSubject<BluePrintTool[] | null> = new BehaviorSubject(null);
  toggleMultiSelect$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  toggleShowGrid$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  toggleSnapGrid$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  nodesForUpdate: any = [];
  selectedArrow: DrawArrow;
  domainsList: String[] = [];
  hideList = true;
  loaded = false;
  domain = '';
  isError = false;
  isWaiting = false;
  errMessage = 'Something went wrong, please check domain and try again.';
  errMessageReturned = '';
  isMultiSelectActive = false;
  showGrid =  false;
  snapGrid = false;
  toolsLoaded = false;
  authUser: User;
  arrowHelper: ArrowsHelper = new ArrowsHelper();
  // subscriptions
  private stackRequest: Subscription;

  /*
   * Deprecated on unload listener
   * 
  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    if (!this.authUser && !window['requestToSignIn']) {
      const dialogText = 'Save Your Stack Before You Go';
      // console.log(this.authUser);
      event.returnValue = true;
      setTimeout(() => { this.showPopupFoSignUp(); }, 300);
      return dialogText;
    }
  }
  */


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
    // console.log(this.id);
    this.route.queryParams.subscribe((params: any) => {
      this.domain = params.domain;
      // console.log(params);
      window['dataLayer'] = window['dataLayer'] || [];
      this.authUser = this.auth.getCurrentUser();
      // console.log(this.authUser);
    });
  }

  canDeactivate(): boolean {
    if (!this.authUser && !window['requestToSignIn']) {      
      if (confirm('Save Your Stack Before You Go')) {
        this.showPopupFoSignUp();
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  ngOnInit(): void {
    if (this.domain) {
      if (this.authUser) {
        this.stackRequest = this.service.postDomainTools(this.domain).subscribe((data) => {   

          if (typeof data === 'string' && String(data).includes('Error: ')) {
            this.errMessageReturned = data;
            this.emitErrorToDataLayer('service.postDomainTools',this.errMessageReturned);
          } else if (data.blueprint?.errorCode && data.blueprint?.errorMessage) {
              //builtwith returned error, show popup for building custom stack
              const dialogRef = this.inviteDialog.open(LoadEmptyStackDialogComponent, {
                width: '520px',
                data: { domain: this.domain, errorMessage: data.blueprint.errorMessage }
              });            
          }
          if (!this.toolsLoaded) {
            this.proceedBluePrintData(data);
            this.toolsLoaded = true;
          }
        }, err => this.isError = true );
      } else {
        this.stackRequest = this.service.getDomainTools(this.domain).subscribe((data) => {
          if (typeof data === 'string' && String(data).includes('Error: ')) {
            this.errMessageReturned = data;
            this.emitErrorToDataLayer('service.getDomainTools',this.errMessageReturned);
          }
          if (!this.toolsLoaded) {
            this.proceedBluePrintData(data);
            this.toolsLoaded = true;
          }
        }, err => this.isError = true );
      }
    } else if (this.id) {
      this.stackRequest = this.service.getBlueprint(this.id).subscribe((data) => {
        if (typeof data === 'string' && String(data).includes('Error: ')) {
          this.errMessageReturned = data;
          this.emitErrorToDataLayer('service.getBlueprint',this.errMessageReturned);
        }
        if (!this.toolsLoaded) {
          this.proceedBluePrintData(data);
          this.toolsLoaded = true;
        }
      }, err => this.isError = true );
    } else {
      this.isError = true;
      this.emitErrorToDataLayer('Unknown error in build-stack.components ngOnInit',this.errMessageReturned);
    }
  }

  private emitErrorToDataLayer(type,message) {
    window['dataLayer'].push({
      event: 'stackbuilder.node.debug',
      data:  {
        error_context: 'frontend',
        error_type: type,
        error_message: message
      }
    });
  }

  private proceedBluePrintData(data) {
    if (typeof data === 'string') {
      return this.isError = true;
    } 
    
    let hidden = 0;
    this.blueprint = data.blueprint;
    this.globalHiddenTools = data.hiddenTools;
    this.toolsHiddenGlobally$.next({nodes: data.hiddenTools});
    data.nodes.forEach((item) => {  
      if (item.toolId) {
        const tool = data.tools.find((atool) =>  atool.id === item.toolId );
        item.tool = tool;
        if (tool.tag && tool.tag === 'domain') {
           // console.log(tool);
           this.domainsList.push(tool.name);
        }    
        if (this.globalHiddenTools.some(hiddenTool => hiddenTool.id === item.tool.id)) {
          item.hiddenGlobally = true;
        } else {
          item.hiddenGlobally = false;
        }
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

        //TESTING
        //console.log('forbiddenTools',item.tool.name,item.tool,forbiddenTools.includes(item.tool.name) );
        //console.log('forbiddenTags',item.tool.tag,item.tool,forbiddenTags.includes(item.tool.tag) );
 
        //TODO
        //this IF statement is complex and should be simplified if possible
        if (
          !item.hide && ( 
             this.verifyOrderToHide(item.tool.categories) 
          || (item.tool.tag == 'domain' && !item.tool.name.replace(/^www\./i, "").toLowerCase().includes(this.blueprint.domain.replace(/^www\./i, "").toLowerCase()))  
          || forbiddenTools.includes(item.tool.name) 
          || forbiddenTags.includes(item.tool.tag) || oldTool 
          || (this.globalHiddenTools.length > 0 && this.globalHiddenTools.some(tool => tool.name === item.tool.name))

        ) 
          && ( 
            item.tool.tag !== 'analytics' 
            || oldTool
            || (item.tool.tag == 'analytics' && forbiddenTools.includes(item.tool.name))
            || (item.tool.tag == 'analytics' && (this.globalHiddenTools.length > 0 && this.globalHiddenTools.some(tool => tool.name === item.tool.name)))
            ) && all - hidden > 5) {
          
          //console.log('found',item.tool.name);

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

  public toggleShowGrid() {
    this.showGrid = !this.showGrid;
    this.toggleShowGrid$.next(this.showGrid);
  }

  public toggleSnapGrid() {
    this.snapGrid = !this.snapGrid;
    this.toggleSnapGrid$.next(this.snapGrid);
  }

  showPopupFoSignUp(form = 'signup') {
    // console.log(form);
    const dialogRef = this.showRegisterDialog.open(SignupSigninPopupComponent, {
      width: '640px',
      data: { blueprint: this.blueprint, form }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  shareUrlPopup() {
  const { origin, pathname, hash } = window.location;
  const [path, queryString = ''] = hash.split('?');

  const params = new URLSearchParams(queryString);
  const domain = params.get('domain');

  const cleanHash = domain ? `${path}?domain=${domain}` : path;
  const shareUrl = `${origin}${pathname}${cleanHash}`;

  const dialogRef = this.infoDialog.open(ShareUrlDialogComponent, {
    width: '520px',
    data: { url: shareUrl }
  });

  dialogRef.afterClosed().subscribe(() => {
    console.log('Share URL dialog closed');
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
    let strPrice = price.toString();
    let dotText = '';
    /*if (price >= 1000) {
      const tPrice = Math.floor(price / 1000);

      return (tPrice ? (tPrice + ', ') : ' ') + (price - tPrice * 1000);
    } else {
      return price.toString();
    }*/
    if (strPrice.indexOf('.')) {
      const temp = strPrice.split('.');
      dotText = temp[1];
      strPrice = temp[0];
    }
    if (strPrice.length > 3) {
      const lastSymbol = strPrice.length;
      const endComa = lastSymbol - 3;
      const sub1 = strPrice.substring(endComa, lastSymbol);
      let sub2 = strPrice.substring(0, endComa);
      // console.log(sub2);
      if (sub2.length > 3) {
        const tempLast = sub2.length;
        const tempSpace = tempLast - 3;
        const temp1 = sub2.substring(tempSpace, tempLast);
        const temp2 = sub2.substring(0, tempSpace);
        sub2 = temp2 + ' ' + temp1;
      }
      return sub2 + ', ' + sub1 + (dotText ? '.' + dotText : '');
    }

    return strPrice + (dotText ? '.' + dotText : '');
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
      this.deleteArrowDots(this.selectedArrow);
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

    if (!data.disableGTM) {
      window['dataLayer'].push({
        event: 'stackbuilder.node.updatePosition',
        node:  this.nodes[data.nodeId],
        newPosition: data.position,
        oldPosition,
        tool: this.nodes[data.nodeId].tool
      });
    }

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

    //nodes processed and stack is loaded

    let tools = [];
    let hiddenTools = [];    

    // Loop through each ID in nodesList
    this.nodesList.forEach(id => {
     

      try {
        let node = this.nodes[id];

        if (node) {             

          // Check the hide property and push tool.name to the appropriate array
          if (node.tool && node.tool.name && node.tool.name !== this.domain) {
            if (node.hide) {
              hiddenTools.push(node.tool?.name);
            } else {
              tools.push(node.tool?.name);
            }
          }
        }
      } catch (error) {
        //node id not in obj array
      }  
    });

    const params = {
      tools: tools,
      hiddenTools: hiddenTools,
      categories: Object.keys(this.categories),
      domainsList: this.domainsList,
      domain: this.domain,
      isError: this.isError,
      errMessageReturned: this.errMessageReturned
    };

    console.log('loadedStack');
    window['dataLayer'].push({
      event: 'stackbuilder.loadedStack',
      data: params
    });

    if (this.nodesForUpdate.length) {
      this.service.hideNodes(this.nodesForUpdate).subscribe((data) => {
        this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList, domain: this.blueprint.domain });
        this.changedCategories$.next( this.categories );
        this.getArrowsList();
      });
    } else {
      this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList, domain: this.blueprint.domain });
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
  
  public handleResetControlPoints() {
    console.log('handleResetControlPoints',this.selectedArrow);
    if (this.selectedArrow) this.selectedArrow.controlPoints = [];
    this.service.getArrows(this.blueprint.id).toPromise().then((data) => {
      
      console.log(data);

      data.forEach(obj => {
        if (obj.id === this.selectedArrow.id) {
          console.log('found it');
            obj.controlPoints = [];
        }
      });

      this.service.updateArrow({id: this.selectedArrow.id, controlPoints: []}).toPromise().then((result) => { /* */ }).catch(err => console.log(err));
      //this.handleDeselectArrow();
      
      this.changedArrows$.next(data);
      this.resetArrowControlPoints();

    }).catch((err) => { console.log(err); });
  }

  public handleDeselectArrow() {
    document.querySelector(`path#${this.selectedArrow.lineId}`).setAttribute('stroke-width', '2');
    this.deleteArrowDots(this.selectedArrow);

    document.querySelector(`#node-${this.selectedArrow.start.nodeId}`).classList.remove('has-selected-arrow');
    document.querySelector(`#node-${this.selectedArrow.end.nodeId}`).classList.remove('has-selected-arrow');
    this.selectedArrow = null;

    this.builderComponent.deselectArrow();

  }

  public handleChangeArrowPosition() {
    
    if (this.selectedArrow) {
      if (this.selectedArrow.arrowPosition == 'start') this.selectedArrow.arrowPosition = 'end';
      else if (this.selectedArrow.arrowPosition == 'end') this.selectedArrow.arrowPosition = 'both';
      else if (this.selectedArrow.arrowPosition == 'both') this.selectedArrow.arrowPosition = 'start';

      
      

      //TODO
      //trigger redraw in builder component for the arrow

      
      this.service.getArrows(this.blueprint.id).toPromise().then((data) => {
        
        console.log(data);

        data.forEach(obj => {
          if (obj.id === this.selectedArrow.id) {
            console.log('found it');
              obj.arrowPosition = this.selectedArrow.arrowPosition;
          }
        });

        this.service.updateArrow({id: this.selectedArrow.id, arrowPosition: this.selectedArrow.arrowPosition}).toPromise().then((result) => { /* */ }).catch(err => console.log(err));
        //this.handleDeselectArrow();
        this.changedArrows$.next(data);
        
      }).catch((err) => { console.log(err); });
      

    }
    
   
  }

  public deleteArrowDots(selectedArrow) {
      const dot1 = document.querySelector(`#dot-${selectedArrow.start.nodeId}`);
      if (dot1) { dot1.remove(); }
      const dot2 = document.querySelector(`#dot-${selectedArrow.end.nodeId}`);
      if (dot2) { dot2.remove(); }
      const controlPoint1 = document.querySelector(`#control1-${selectedArrow.lineId}`);
      if (controlPoint1) { controlPoint1.remove(); }
      const controlPoint2 = document.querySelector(`#control2-${selectedArrow.lineId}`);
      if (controlPoint2) { controlPoint2.remove(); }
  }

  public resetArrowControlPoints() {
    if (this.selectedArrow) {

      
      const line = document.querySelector(`path#${this.selectedArrow.lineId}`);
      const dots = this.arrowHelper.genrateDots(
        [this.selectedArrow.start.x, this.selectedArrow.start.y], 
        [this.selectedArrow.end.x, this.selectedArrow.end.y], 
        this.selectedArrow.start.pos, 
        this.selectedArrow.end.pos, [], false, this.selectedArrow.arrowPosition); 

        console.log('resetDots',dots);

      const controlPoint1 = document.querySelector(`#control1-${this.selectedArrow.lineId}`) as HTMLElement;
      if (controlPoint1) controlPoint1.style.transform = `translate3d(${dots[1][0] - 25}px, ${dots[1][1] - 25}px, 0px)`;
      const controlPoint2 = document.querySelector(`#control2-${this.selectedArrow.lineId}`) as HTMLElement;
      if (controlPoint2) controlPoint2.style.transform = `translate3d(${dots[2][0] - 25}px, ${dots[2][1] - 25}px, 0px)`;
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
          window['dataLayer'].push({
            event: 'stackbuilder.node.loaded',
            node: result,
            tool: result.tool,
          });
          window['dataLayer'].push({
            event: 'stackbuilder.node.added',
            node: result,
            tool: result.tool,
            stack: this.blueprint
          });
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

  public handleClickNode(id: string) {
    console.log('handleClickNode');
    if (this.selectedArrow) this.handleDeselectArrow();
  }

  public handleMouseoverNode(id: string) {
    //console.log('handleMouseoverNode');
    //if (this.selectedArrow) this.handleDeselectArrow();
  }

  public handleClickWorkspace(event) {
    console.log('handleClickWorkspace');
    //if (this.selectedArrow) this.handleDeselectArrow();
  }

  public handleAddNewTool() {
    const dialogRef = this.deleteDialog.open(AddNewToolDialogComponent, {
      width: '620px',
      data: { blueprintId: this.blueprint.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
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
    console.log(listToCreate, listToUnhide, tools);
    let nodes = [];
    let unhideNodes = [];

    //TODO
    //check if any node in this list is already unhidden. if so, remove it from listToUnhide and add to listToCreate
    /*if (listToUnhide.length) {       
      let processingArray = [];
      listToUnhide.forEach(tool_id => {
        if (this.nodes[tool_id] && !this.nodes[tool_id].hide) {
          console.log('tool exists and unhidden');
          console.log(this.nodes[tool_id]);
          let clonedTool = this.nodes[tool_id];
          clonedTool.position.x = 0;
          clonedTool.position.y = 600;
          listToCreate.push(clonedTool);
        } else if (this.nodes[tool_id] && this.nodes[tool_id].hide) {
          console.log('tool exists and hidden');
          processingArray.push(tool_id);
        }
      });

      listToUnhide = [...processingArray];      
    }*/

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
    this.deleteArrowDots(this.selectedArrow);
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
    var a = document.createElement('a');
    a.href="/marketing-technology-tech-stack-builder/";
    a.click();
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

    console.log(' handleHideNodeItem - ', data);
    if (!data.disableHistory) {  this.history.addAction(this.blueprint.id, { name: 'hideNode', data }); }

    this.service.updateNodeTool(data.item.id, { hide: data.item.hide }, this.blueprint.id).subscribe((res) => {
      res.tool = this.nodes[data.item.id].tool;
      this.nodes[data.item.id] = res;
      this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList, domain: this.blueprint.domain  });
    });
  }



  public handleGlobalHideNodeItem(data: { item: BluePrintTool, disableHistory?: boolean, isHidden?: boolean }) {
        
    let nodesArray = Object.values(this.nodes);
    let nodeItem = nodesArray.find(node => node.toolId === data.item.tool.id);
    if (nodeItem && this.nodes[nodeItem.id]) this.nodes[nodeItem.id].isUpdatingToolVisibility = true;

    //update the tool in the database 
    this.service.updateToolVisibility(data.item, !data.isHidden).subscribe((res) => {
   
      let tool = res;

      console.log('updated tool',tool.id,tool.hidden);
      //console.log('this.nodes',this.nodes);     
      
      let updatedNode = nodesArray.find(node => node.toolId === tool.id);
      if (updatedNode) {
        if (this.nodes[updatedNode.id]) {
          this.nodes[updatedNode.id].isUpdatingToolVisibility = false;
          this.nodes[updatedNode.id].hiddenGlobally = tool.hidden;
        }
      }  
   
      this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList, domain: this.blueprint.domain  });
     
    });

  }

  public handleAddArrow(data) {
    console.log('handleAddArrow');
    // console.log(data);
    if (!data.disableHystory) {
      this.history.addAction(this.blueprint.id, { name: 'addArrow', data: data.arrow });
      window['dataLayer'].push({
        event: 'stackbuilder.node.connected',
        parentTool: this.nodes[data.arrow.start.nodeId].tool,
        childTool: this.nodes[data.arrow.end.nodeId].tool,
        stack: this.blueprint
      });
    }
    this.service.addArrow(this.blueprint.id, data.arrow).toPromise().then((result) => {
      // console.log(result);
    }).catch(err => console.log(err));
  }

  public handleAddAdditionalDomain() {
    const dialogRef = this.deleteDialog.open(AdditionalDomainComponent, {
      width: '570px',
      data: { blueprint: this.blueprint }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result 
        let listToHide = [];
        let newItems = 0;

        result.forEach(nodeItem => {
          let oldTool = false;
          if (nodeItem.end) {
            const endDate = new Date(nodeItem.end);
            const diff = Date.now() - endDate.getTime();
            if (diff > 7776000000) {
              oldTool = true;
            }
          }

          if (nodeItem.tool.tag && nodeItem.tool.tag === 'domain') {
            this.domainsList.push(nodeItem.tool.name);
            window['dataLayer'].push({
              event: 'stackbuilder.domain.add',
              node: nodeItem,
              tool: nodeItem.tool,
            });
          }
          // console.log(this.verifyOrderToHide(nodeItem.tool.categories), forbiddenTags.includes(nodeItem.tool.tag), oldTool, newItems >= maxNewVisibleItems);
          if (( this.verifyOrderToHide(nodeItem.tool.categories) || forbiddenTags.includes(nodeItem.tool.tag) ) || 
              newItems >= maxNewVisibleItems ) {
            nodeItem.hide = true;
            listToHide.push( nodeItem.id );
          } else {
            newItems++;
          }

          this.nodes[nodeItem.id] = nodeItem;
          window['dataLayer'].push({
            event: 'stackbuilder.node.loaded',
            node: nodeItem,
            tool: nodeItem.tool,
          });

          if (!nodeItem.hide) {
            window['dataLayer'].push({
              event: 'stackbuilder.node.added',
              node: result,
              tool: result.tool,
              stack: this.blueprint
            });
          }
        });
        
        this.addedNewNode$.next(result);
        if (listToHide.length) {
          this.service.hideNodes(listToHide).subscribe((data) => {
            /* this.changedNodes$.next({ nodes: this.nodes, list: this.nodesList, domain: this.blueprint.domain });
            this.changedCategories$.next( this.categories );
            this.getArrowsList(); */
          });
        }
        /*window['dataLayer'].push({
          event: 'stackbuilder.node.loaded',
          node: result,
          tool: result.tool,
        });
        window['dataLayer'].push({
          event: 'stackbuilder.node.added',
          node: result,
          tool: result.tool,
          stack: this.blueprint
        });*/
      }
    });
  }

  public handleUpdateArrow(data) {
    if (!data.disableHistory) {  this.history.addAction(this.blueprint.id, { name: 'updateArrow', data: Object.assign({}, data) }); }
    console.log('updateArrow',data);
    this.service.updateArrow(data.newData).toPromise().then((result) => { }).catch(err => console.log(err));
  }

  public handleHideNode(data) {
    window['dataLayer'].push({
      event: 'stackbuilder.node.hide',
      node: data.item,
      tool: data.item.tool,
      stack: this.blueprint
    });
    if (!data.disableHistory) {
      this.history.addAction(this.blueprint.id, { name: 'hideNode', data });
    }
    console.log(' handleHideNode - ', data);
    this.service.updateNodeTool(data.item.id, { hide: data.item.hide }, this.blueprint.id).subscribe((res) => {
      res.tool = this.nodes[data.item.id].tool;
      this.nodes[data.item.id] = res;
    });
  }

  public handleGlobalHideNodeItemFromStack(data) {
    window['dataLayer'].push({
      event: 'stackbuilder.node.hide',
      node: data.item,
      tool: data.item.tool,
      stack: this.blueprint
    });
    if (!data.disableHistory) {
      this.history.addAction(this.blueprint.id, { name: 'hideNode', data });
    }
    console.log(' handleHideNodeFromStack - ', data);
    this.service.updateNodeTool(data.item.id, { hide: data.item.hide }, this.blueprint.id).subscribe((res) => {
      res.tool = this.nodes[data.item.id].tool;
     /////this.nodes[data.item.id] = res;
     //update the tool in the database 
    this.service.updateToolVisibility(data.item, !data.isHidden).subscribe((res) => {
   
      this.nodes[data.item.id].hiddenGlobally = res.hidden;

     
    });

     
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

  ngOnDestroy() {
    if (this.stackRequest) {
      this.stackRequest.unsubscribe();
    }
  }

}
