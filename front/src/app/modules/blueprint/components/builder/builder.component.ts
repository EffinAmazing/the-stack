import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { Tool, BluePrintTool } from '../../../../shared/models/tool';
import { Pointer, Area } from '../../../../shared/models/general';
import { DrawArrow } from '../../../../shared/models/draws-item';
import { MatDialog } from '@angular/material/dialog';
import { NodeDetailsComponent } from '../node-details/node-details.component';
import { ArrowsHelper } from '../../../../shared/helper/arrows-draw.helper';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmActionDialogComponent } from '../../../../shared/components/confirm-action-dialog/confirm-action-dialog.component';
import * as d3 from 'd3';

const containerOffset = 0;
const dotRadius = 9;
const lineGenerator = d3.line().curve(d3.curveBasis);
const host = environment.serverURI;

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stackWorkFlow') stackWorkFlow: ElementRef<HTMLDivElement>;
  @ViewChild('selectMany') selectMany: ElementRef<HTMLDivElement>;
  @ViewChild('selectorArea') selectorArea: ElementRef<HTMLDivElement>;
  @ViewChild('moveSelectedArea') moveSelectedArea: ElementRef<HTMLDivElement>;
  @ViewChild('svgPaint') svgPaint: ElementRef<HTMLElement>;
  @Output() positionNodeChanged: EventEmitter<{
    nodeId: string,
    position: Pointer,
    disableHistory?: boolean
  }> = new EventEmitter();
  @Output() updatedNodeData: EventEmitter<any> = new EventEmitter();
  @Output() arrowAdded: EventEmitter<{ arrow: DrawArrow, disableHystory: boolean }> = new EventEmitter();
  @Output() arrowUpdated: EventEmitter<{ newData?: DrawArrow, oldData?: DrawArrow, disableHistory?: boolean}> = new EventEmitter();
  @Output() hideNode: EventEmitter<{ item: BluePrintTool, arrows?: Array<DrawArrow>, disableHistory?: boolean }> = new EventEmitter();
  @Output() hideGlobalVisibilityNode: EventEmitter<any> = new EventEmitter();
  @Output() removeArrows: EventEmitter<string[]> = new EventEmitter();
  @Output() selectArrow: EventEmitter<any> = new EventEmitter();
  @Output() callEditNode: EventEmitter<string> = new EventEmitter();
  @Output() clickNode: EventEmitter<string> = new EventEmitter();
  @Output() mouseoverNode: EventEmitter<string> = new EventEmitter();
  @Output() clickWorkspace: EventEmitter<any> = new EventEmitter();
  @Output() groupMoveCompleted: EventEmitter<{ nodeIds: string[], diff: Pointer }> = new EventEmitter();
  @Input() loadedNodes: Observable<any>;
  @Input() loadedArrows: Observable<any>;
  @Input() historyEmit: Observable<any>;
  @Input() addedNewNode: Observable<any>;
  @Input() updatedOutNodeData: Observable<any>;
  @Input() multiselect: Observable<boolean>;
  @Input() showGrid: Observable<boolean>;
  @Input() snapGrid: Observable<boolean>;
  @Input() domainsList: String[];
  @Input() toolsHiddenGlobally: Observable<any>;
  isMultiselect = false;
  arrowHelper: ArrowsHelper = new ArrowsHelper();
  selectedArrow: any;
  nodes: BluePrintTool[] = [];
  // nodes: BluePrintTool[] = [];
  showNodes: BluePrintTool[] = [];
  listOfArrows: Array<DrawArrow> = [];
  connectedLines: Array<DrawArrow> = [];
  activeArrow: DrawArrow;
  svgD3: any;
  activeNode;
  startPositionNode = '';
  isMoving = false;
  oldArrowData: DrawArrow | null;
  dotForDrag: HTMLDivElement | null = null;
  lastActionDrag = false;
  currentPathPoints: any[] | null = null;
  disableTillDrawLine = false;
  startSelecting = false;
  starMoveSelected = false;
  startPointer: Pointer = { x: -1, y: -1 };
  selectOffsetData: Pointer = { x: 0, y: 0 };
  selectedNodes: Array<{ node: BluePrintTool, elRef: HTMLDivElement }> = [];
  moveSelectStart: Pointer = { x: -1, y: -1 };
  isDrawingArrow = false;
  useSnapGrid = false;
  // subscriptions
  indexNode = 0;
  isUserAdmin: Boolean;
  nodesSubscription: Subscription;
  arrowSubscription: Subscription;
  addedNewNodeSubcription: Subscription;
  historySubscription: Subscription;
  updateNodeDataSubscription: Subscription;
  gridSubscription: Subscription;
  snapSubscription: Subscription;
  globalHiddenTools: Tool[] = [];

  constructor(private detailsDialog: MatDialog, private confirm: MatDialog, public auth: AuthService) {  }

  ngOnInit(): void {
    this.svgD3 = this.arrowHelper.initSvg('svg#paint');
    const user = this.auth.getCurrentUser();

    if (user) this.isUserAdmin = user.role === 0;

    const offsetX = 200;
    const offsetY = 55;
    const maxItems = 5;
    const arrToChange = [];

    let index = 0;
    // console.log(this.multiselect);
    /* this.multiselect.subscribe(result => {
      this.isMultiselect = result;
      if (!result) {
        if ( this.selectedNodes.length > 0 ) {
          this.selectedNodes.forEach(item => {
            item.elRef.classList.remove('selected');
          });

          this.moveSelectedArea.nativeElement.style.display = 'none';
        }
      }
    });*/
    /*
    this.snapSubscription = this.snapGrid.subscribe(use => {
      console.log(' * snapSubscription * ', use);
      this.useSnapGrid = use;
    });
    */

    this.gridSubscription = this.showGrid.subscribe((show) => {
      if (show) {
        this.svgD3.append('rect')
          .attr('id', 'builder_grid_rect')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('fill', 'url(#grid)');
      } else {
        this.svgD3.select('rect#builder_grid_rect').remove();
      }
    });

    this.nodesSubscription = this.loadedNodes.subscribe((data) => {
      this.showNodes = [];
      // console.log(' *** loadedNodes ****');
      /*  */
      if (data.list) {
        let isNewStack = true;
        data.list.forEach((nodeId) => {
          const item = data.nodes[nodeId];

          //
          if (!item.hide) {
            if (typeof item.position.x !== 'number') {
              if (item.tool.tag === 'domain') {
                item.position.y = 0;
                item.position.x = Math.floor(maxItems / 2) * offsetX;
              } else {
                const yIndex = Math.floor(this.indexNode / maxItems);
                const xIndex = (this.indexNode - yIndex * maxItems);
                item.position.y = (yIndex + 1) * offsetY + Math.floor(offsetY * 0.5);
                item.position.x = xIndex * offsetX;
                window['dataLayer'].push({
                  event: 'stackbuilder.node.loaded',
                  node: item,
                  tool: item.tool
                });
              }
              arrToChange.push({nodeId: item.id, position: item.position});
              this.indexNode++;
            } else {
              isNewStack = false;
            }
            this.showNodes.push(item);
          } else {
            if (this.nodes[item.id] && this.listOfArrows.length) {
                // console.log('hidden item');
                const arrowsToRemove = this.listOfArrows.filter((arrow) => arrow.lineId.indexOf(item.id) !== -1 );
                const ids: string[] = [];
                if (arrowsToRemove.length) {
                  arrowsToRemove.forEach(element => {
                    ids.push(element.lineId);
                    this.svgD3.select('path#' + element.lineId).remove();
                  });

                  setTimeout(() => { this.removeArrows.emit(ids); }, 0);
                }
            }
          }

        });

        this.nodes = data.nodes;
        // console.log(data);
        if (isNewStack) {
          window['dataLayer'].push({
            event: 'stackbuilder.create',
            domain: data.domain
          });
        }

        const promises = arrToChange.map(async (props) => {
          props.disableHistory = true;
          props.disableGTM = true;
          this.positionNodeChanged.emit(props);
          return props;
        });

        Promise.all(promises).then((result) => { }).catch((err) => {
          console.log(err);
        });
      }

      if (data.hiddenItem) {
        const arrowsToRemove = this.listOfArrows.filter((item) => item.lineId.indexOf(data.hiddenItem) !== -1 );
        const ids = [];
        if (arrowsToRemove.length) {
          arrowsToRemove.forEach(element => {
            ids.push(element.lineId);
            this.svgD3.select('path#' + element.lineId).remove();
          });

          this.removeArrows.emit(ids);
        }
      }
    });

    this.arrowSubscription = this.loadedArrows.subscribe((list) => {
      //console.log('this.arrowSubscription',list);
      list.forEach((item) => {
        if ( document.querySelector(`path#${item.lineId}`) ) { } else {
          if (typeof item.start.offset === 'undefined') {
            item.start.offset = 50;
            if (item.start.pos !== 'Left' || item.start.pos !== 'Right') {
              if (item.start.pos.indexOf('Top')) {
                item.start.pos = 'Top';
              } else {
                item.start.pos = 'Bottom';
              }
            }
          }
          if (typeof item.end.offset === 'undefined') {
            item.end.offset = 50;
            if (item.end.pos !== 'Left' || item.end.pos !== 'Right') {
              if (item.end.pos.indexOf('Top')) {
                item.end.pos = 'Top';
              } else {
                item.end.pos = 'Bottom';
              }
            }
          }

          if (!item.arrowPosition) item.arrowPosition = "start";

          this.addNewArrow(item);
        }

        setTimeout(() => { this.redrawArrows(); }, 100);

      });
    });

    this.historySubscription = this.historyEmit.subscribe((result) => {
      // console.log(result);
      if (result) {
        const container = this.stackWorkFlow.nativeElement;
        //console.log('action:',result.action.name);
        switch (result.action.name) {
          case 'updatePosition':
            const i = this.showNodes.findIndex((item) => item.id === result.action.data.nodeId);
            if (result.undo) {
              this.nodes[result.action.data.nodeId].position = result.action.data.oldPosition;
            } else {
              this.nodes[result.action.data.nodeId].position = result.action.data.newPosition;
            }
            this.showNodes.splice(i, 1);
            this.showNodes.push(this.nodes[result.action.data.nodeId]);
            const lines = this.listOfArrows.filter((item) => item.start.nodeId === result.action.data.nodeId ||
            item.end.nodeId === result.action.data.nodeId );
            setTimeout(() => {
                lines.forEach((item) => {
                  //TODO
                  //clear control points since we are doing undo position on a node?
                  //edge case?
                  this.arrowHelper.updateExistedArrow(item, container);
                });
              }, 100);

            this.positionNodeChanged.emit({ nodeId: result.action.data.nodeId,
              position: this.nodes[result.action.data.nodeId].position, disableHistory: true  });
            if (this.selectedArrow) this.updatePointPositionArrow(this.selectedArrow.lineId);  
            break;

          case 'hideNode':
            const j = this.showNodes.findIndex((item) => item.id === result.action.data.item.nodeId);
            // console.log( result.action.data );
            const nodeHide = result.action.data.item;
            if (result.undo) {
              if (j === -1) {
                nodeHide.hide = false;
                this.nodes[nodeHide.id].hide = false;
                this.doHideNode(nodeHide, true);
                this.showNodes.push(nodeHide);
                result.action.data.arrows.forEach(theArrow => {
                  this.restoreArrow(theArrow);
                });
              }
            } else {
              nodeHide.hide = true;
              this.nodes[nodeHide.id].hide = true;
              // console.log(nodeHide, this.nodes[nodeHide.id]);
              this.showNodes.splice(j, 1);
              this.doHideNode(nodeHide, true);
            }
            break;
          case 'addArrow':
            if (result.undo) {
              this.removeSingleArrow(result.action.data.lineId);
            } else {
              this.drawArrow(result.action.data);
              setTimeout(() => this.arrowHelper.updateExistedArrow(result.action.data, container), 100);
            }
            break;
          case 'removeArrow':
            if (result.undo) {
              this.drawArrow(result.action.data);
              setTimeout(() => this.arrowHelper.updateExistedArrow(result.action.data, container), 100);
            } else {
              this.removeSingleArrow(result.action.data.lineId);
            }
            break;
          case 'updateArrow':
            if (result.undo) {
              const k = this.listOfArrows.findIndex((item) => item.lineId === result.action.data.oldData.lineId);
              this.listOfArrows.splice(k, 1, result.action.data.oldData);
              this.arrowHelper.updateExistedArrow(result.action.data.oldData);
            } else {
              const k = this.listOfArrows.findIndex((item) => item.lineId === result.action.data.newData.lineId);
              this.listOfArrows.splice(k, 1, result.action.data.newData);
              this.arrowHelper.updateExistedArrow(result.action.data.newData);
            }
            if (this.selectedArrow) this.updatePointPositionArrow(this.selectedArrow.lineId);
            break;
          case 'groupMove':
            const nodes = this.showNodes.filter(item => {
              return result.action.data.nodeIds.findIndex(nodeId => nodeId === item.id) !== -1;
            });

            const selectedNodes = nodes.map((item) => {
              const elRef = document.querySelector(`#node-${item.id}`) as HTMLDivElement;
              return { node: item, elRef };
            });

            const arrowLines = this.listOfArrows.filter((itemArrow) => {
              let start = false;
              let end = false;

              start = nodes.findIndex((node) => itemArrow.start.nodeId === node.id) !== -1;
              end = nodes.findIndex((node) => itemArrow.end.nodeId === node.id) !== -1;
              return start || end;
            });

            const diff = result.action.data.diff;
            let toUpdate: Array<{ nodeId: string, position: Pointer }> = [];
            if (result.undo) {
              if (this.moveSelectedArea) {
                this.moveSelectedArea.nativeElement.style.transform = `translate3d(0px, 0px, 0px)`;
                const y = parseInt( this.moveSelectedArea.nativeElement.style.top, 10 );
                const x = parseInt( this.moveSelectedArea.nativeElement.style.left, 10 );
                this.moveSelectedArea.nativeElement.style.top = (y - diff.y) + 'px';
                this.moveSelectedArea.nativeElement.style.left = (x - diff.x) + 'px';
              }
              toUpdate = selectedNodes.map(item => {
                item.elRef.style.transform = `translate3d(${item.node.position.x - diff.x}px, ${item.node.position.y - diff.y}px, 0px)`;
                item.node.position = { x: item.node.position.x - diff.x, y: item.node.position.y - diff.y };
                return { nodeId: item.node.id, position: item.node.position };
              });
            } else {
              if (this.moveSelectedArea) {
                this.moveSelectedArea.nativeElement.style.transform = `translate3d(0px, 0px, 0px)`;
                const y = parseInt( this.moveSelectedArea.nativeElement.style.top, 10 );
                const x = parseInt( this.moveSelectedArea.nativeElement.style.left, 10 );
                this.moveSelectedArea.nativeElement.style.top = (y + diff.y) + 'px';
                this.moveSelectedArea.nativeElement.style.left = (x + diff.x) + 'px';
              }
              toUpdate = selectedNodes.map(item => {
                item.elRef.style.transform = `translate3d(${item.node.position.x + diff.x}px, ${item.node.position.y + diff.y}px, 0px)`;
                item.node.position = { x: item.node.position.x + diff.x, y: item.node.position.y + diff.y };
                return { nodeId: item.node.id, position: item.node.position };
              });

            }
            const promises = toUpdate.map(async (props) => {
              this.positionNodeChanged.emit(Object.assign({}, props, { disableHistory: true }));
              return props;
            });

            Promise.all(promises).then(() => {
              // console.log('position updated');
            }).catch((err) => {
              console.log(err);
            });
            if (arrowLines) {
              const updatedLines = arrowLines.map(async (item) => {
                item.controlPoints = []; //reset control points since we are moving node
                this.arrowHelper.updateExistedArrow(item, container);
                return this.arrowUpdated.emit({ newData: item, disableHistory: true });
              });

              Promise.all(updatedLines).then(() => { /*console.log('completed update');*/ }).catch(err => console.log(err));
            }
            break;
        }
      }
    });

    this.addedNewNodeSubcription = this.addedNewNode.subscribe(res => {
      const start = 10;

      let arrToChange = [];
      if (res) {
        res.forEach((item, index) => {
          const existNode = this.showNodes.find(node => node.id === item.id);
          if (item.hasOwnProperty('hide') && item.hide ) {
            return true;
          }
          //console.log(item);
          if (!existNode) {
            item.hide = false;
            if (typeof item.position.x !== 'number') {
              item.position.y = 0;
              const yIndex = Math.floor(this.indexNode / maxItems);
              let xIndex = (this.indexNode - yIndex * maxItems);
              if (xIndex === Math.floor(maxItems / 2) && yIndex === 0) {
                xIndex++;
              }
              item.position.y = (start - yIndex) * offsetY + Math.floor(offsetY * 0.5);
              item.position.x = xIndex * offsetX;
              
              arrToChange.push({nodeId: item.id, position: item.position});
              // console.log(yIndex, xIndex);
            }

            this.showNodes.push(item);
            this.indexNode++;
          }
        });

        if (arrToChange.length) {

          const promises = arrToChange.map(async (props) => {
            props.disableHistory = true;
            props.disableGTM = true;
            this.positionNodeChanged.emit(props);
            return props;
          });

          Promise.all(promises).then((result) => { }).catch((err) => {
            console.log(err);
          });
        }
        /* */
      }
    });

    this.updateNodeDataSubscription = this.updatedOutNodeData.subscribe((node) => {
      if (node) {
        const indexNode = this.showNodes.findIndex(item => item.id === node.id);

        if (indexNode) {
          const oldNode = this.showNodes[indexNode];
          const newNode: BluePrintTool = Object.assign({}, oldNode, {
            tool: node.tool,
            cost: node.cost,
            owner: node.owner,
            trainedOn: node.trainedOn,
            start: node.start,
            end: node.end
          });

          newNode.tool.logo += '?v=' + Date.now();

          const newList = [...this.showNodes];
          // console.log(newList, indexNode, oldNode, newNode);
          newList[indexNode] = newNode;
          this.showNodes = newList;
        }
      }
    });
  }

  private restoreArrow(item) {
    this.addNewArrow(item);
    this.arrowAdded.emit({ arrow: item, disableHystory: true });
  }

  private addNewArrow(item) {
    //console.log('item',item);
    
    this.listOfArrows.push(item);
    
    this.svgD3.append('path')
    .attr('id', item.lineId)
    .attr('class', 'line')
    .attr('d', lineGenerator(this.arrowHelper.genrateDots(
      [item.start.x, item.start.y],
      [item.end.x, item.end.y], item.start.pos, item.end.pos, item.controlPoints)))
    .attr('stroke', '#1c57a4')
    .attr('stroke-width', 2)
    .attr('fill', 'transparent')
    .attr('marker-end', 'url(#arrow-marker)');

    //console.log('addNewArrow');
    //console.log('list',this.listOfArrows);

    setTimeout(() => {
      this.addHandleSelectArrow(item.lineId);
    }, 100);
    
  }

  public processImageSrc(link) {
    if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1 ) {
      return link;
    } else {
      return host + link;
    }
  }

  private getAddedAndRemovedItems(prevArr: Array<number | string>, nextArr: Array<number | string>): {
      added: Array<number | string>, removed: Array<number | string> } {
    const added = [];
    const removed = [];
    // console.log('prevArr', prevArr, 'nextArr', nextArr);

    prevArr.forEach(item => {
      if ( nextArr.indexOf( item ) === -1) {
        removed.push(item);
      }
    });

    nextArr.forEach(item => {
      if ((prevArr.length === 0 || prevArr.indexOf(item) === -1) && item !== '') {
        added.push(item);
      }
    });

    return {
      added,
      removed
    };
  }

  public handleClick(node) {

    const dialogRef = this.detailsDialog.open(NodeDetailsComponent, {
      width: '620px',
      data: { node, domainsList: this.domainsList },
      panelClass: 'node-details-custom-wrapper'
    });

    window['dataLayer'].push({
      event: 'stackbuilder.node.openInfo',
      node,
      tool: node.tool,
      via: 'diagram'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        if (typeof result === 'string') {
          this.callEditNode.emit(result);
        } else {
          if (result.cost !== node.cost) {
            window['dataLayer'].push({
              event: 'stackbuilder.node.updateCost',
              oldCost: node.cost,
              newCost: result.cost,
              tool: node.tool,
              node
            });
          }

          if (result.owner !== node.owner) {
            const ownersUpdates = this.getAddedAndRemovedItems(node.owner ? node.owner.split(',') : [], result.owner.split(','));
            ownersUpdates.added.forEach(item => {
              window['dataLayer'].push({
                event: 'stackbuilder.node.addedOwner',
                tool: node.tool,
                email: item,
                node
              });
            });

            ownersUpdates.removed.forEach(item => {
              if (item) {
                window['dataLayer'].push({
                  event: 'stackbuilder.node.removedOwner',
                  tool: node.tool,
                  email: item,
                  node
                });
              }
            });
          }

          if ( result.trainedOn !==  node.trainedOn) {
            const usersUpdates = this.getAddedAndRemovedItems(node.trainedOn ? node.trainedOn.split(',') : [],
              result.trainedOn.split(','));

            // console.log(usersUpdates.added, usersUpdates.removed);
            usersUpdates.added.forEach(item => {
              window['dataLayer'].push({
                event: 'stackbuilder.node.addedUser',
                tool: node.tool,
                email: item,
                node
              });
            });

            usersUpdates.removed.forEach(item => {
              if ( item ) {
                window['dataLayer'].push({
                  event: 'stackbuilder.node.removedUser',
                  tool: node.tool,
                  email: item,
                  node
                });
              }
            });
          }

          node = Object.assign({}, node, result);
          node.position = this.nodes[node.id].position;

          this.nodes[node.id] = node;
          const index = this.showNodes.findIndex((item) => item.id === node.id );
          this.showNodes[index] = node;

          this.updatedNodeData.emit({ nodeId: node.id, data: result });
        }
      }
    });

    this.isMoving = false;
  }

  public relisedMove(data, node: BluePrintTool) {

    //
    /*if (this.hoveredNode && this.hoveredNode.id !== node.id) {
      this.retriveNodePosition(data, node);
      if (!document.querySelector(`path#line-${this.hoveredNode.id + '-' + node.id}`) &&
        !document.querySelector(`path#line-${node.id + '-' + this.hoveredNode.id}`)) {
        this.drawArrowOnDrag(node, this.hoveredNode);
      }
    } else {
    /*  */
      // console.log(' update position ', data.source._dragRef._activeTransform);
      const theNode = this.showNodes.find((item) => item.id === node.id );
      this.positionNodeChanged.emit({ nodeId: node.id, position: data.source._dragRef._activeTransform  });
      let position = data.source._dragRef._activeTransform;
      
      /*
      //do not useSnapGrid
      if (this.useSnapGrid) {
        const X = position.x;
        const Y = position.y;
        position = { x: Math.floor(X / 10) * 10, y: Math.floor(Y / 10) * 10 };
      }
      */
      this.nodes[node.id].position = theNode.position = position;
      // console.log(position);
      if (this.useSnapGrid) {
        // console.log(data.source.element.nativeElement);
      }
      const updatedLines = this.connectedLines.map(async (item) => {
        return this.arrowUpdated.emit({ newData: item, disableHistory: true });
      });

      Promise.all(updatedLines).then(() => { /* console.log('completed update');*/ }).catch(err => console.log(err));

      this.connectedLines = [];
    // }
  }

  public drawArrow(Arrow: DrawArrow) {
    this.listOfArrows.push(Arrow);

    this.svgD3.append('path')
        .attr('id', Arrow.lineId)
        .attr('class', 'line')
        .attr('d', lineGenerator(this.arrowHelper.genrateDots(
            [Arrow.start.x, Arrow.start.y],
            [Arrow.end.x, Arrow.end.y], Arrow.start.pos, Arrow.end.pos, Arrow.controlPoints)))
        .attr('stroke', '#1c57a4')
        .attr('stroke-width', 2)
        .attr('fill', 'transparent')
        .attr('marker-end', 'url(#arrow-marker)');

        //console.log('drawArrow');

    setTimeout(() => {
      // const line = document.querySelector(`path#${Arrow.lineId}`);
      this.addHandleSelectArrow(Arrow.lineId);
    }, 100);

    this.arrowAdded.emit({arrow: Arrow, disableHystory: false});
  }

  public deselectArrow() {
    //console.log('deselect in builder.component');
    this.selectedArrow = null;
  }

  public updateControlPointPositionArrow(ArrowId: string): void {
    const container = this.stackWorkFlow.nativeElement;
    const line = document.querySelector(`path#${ArrowId}`);
    const pathData = line.getAttribute('d');  
    
    let currentPathPoints = this.getPointsFromPath(pathData);

    const control1 = currentPathPoints[1];
    const control2 = currentPathPoints[2];

    console.log(currentPathPoints);

    document.getElementById('control1-' + this.selectedArrow.lineId).style.transform = `translate3d(${control1.x - 25}px, ${control1.y - 25}px, 0px)`;
    document.getElementById('control2-' + this.selectedArrow.lineId).style.transform = `translate3d(${control2.x - 25}px, ${control2.y - 25}px, 0px)`; 
  }
  
  public updatePointPositionArrow(ArrowId: string): void {

    //TODO
    //This does not work, the start position is wrong when updating the control points

    //Until we can fix, just deselect Arrow
    this.lastActionDrag = false;
    this.clickWorkspace.emit();

    /*
    console.log(ArrowId);
    const container = this.stackWorkFlow.nativeElement;
    const line = document.querySelector(`path#${ArrowId}`);
    const pathData = line.getAttribute('d');  
    
    let currentPathPoints = this.getPointsFromPath(pathData);

    const dot1 = currentPathPoints[0];
    const dot2 = currentPathPoints[3];
    const control1 = currentPathPoints[1];
    const control2 = currentPathPoints[2];

    console.log(currentPathPoints);

    document.getElementById('dot-' + this.selectedArrow.start.nodeId).style.transform = `translate3d(${dot1.x - 20}px, ${dot1.y - 20}px, 0px)`;
    document.getElementById('dot-' + this.selectedArrow.end.nodeId).style.transform = `translate3d(${dot2.x - 20}px, ${dot2.y - 20}px, 0px)`;

    document.getElementById('control1-' + this.selectedArrow.lineId).style.transform = `translate3d(${control1.x - 25}px, ${control1.y - 25}px, 0px)`;
    document.getElementById('control2-' + this.selectedArrow.lineId).style.transform = `translate3d(${control2.x - 25}px, ${control2.y - 25}px, 0px)`; 
    */


  }

  public addHandleSelectArrow(ArrowId: string): void {
    const line = document.querySelector(`path#${ArrowId}`);
    
    line.addEventListener('click', (event) => {
      
      event.stopPropagation();

      const container = this.stackWorkFlow.nativeElement;

      //deselect, we are reselecting
      if (this.selectedArrow) {          
          this.svgD3.select('path#' + this.selectedArrow.lineId).attr('stroke-width', 2);
          const adot1 = container.querySelector(`#dot-${this.selectedArrow.start.nodeId}`);
          if (adot1) { adot1.remove(); }
          const adot2 = container.querySelector(`#dot-${this.selectedArrow.end.nodeId}`);
          if (adot2) { adot2.remove(); }
          const c1 = container.querySelector(`#control1-${this.selectedArrow.lineId}`);
          if (c1) { c1.remove(); }
          const c2 = container.querySelector(`#control2-${this.selectedArrow.lineId}`);
          if (c2) { c2.remove(); }          
      }  
      
      //console.log('list',this.listOfArrows);

      this.selectedArrow = this.listOfArrows.find((arrow) => arrow.lineId === ArrowId);

      this.oldArrowData = this.deepCloneArrow(this.selectedArrow);
      const old = this.deepCloneArrow(this.selectedArrow); 

      //console.log('old',old);

      //console.log('ArrowId',ArrowId);
      //console.log('selectedArrow',this.selectedArrow);

      

      // Extract path start and end points from the path data
      const pathData = line.getAttribute('d');
      const pathSegments = pathData.match(/([MLC])[^MLC]*/g);

      if (!pathSegments || pathSegments.length < 2) {
          console.error('Invalid path data');
          return;
      }

      //console.log('pathData',pathData);    

      let currentPathPoints = this.getPointsFromPath(pathData);
      //console.log('getting curPath',currentPathPoints);

      // Calculate control points positions
      const control1 = currentPathPoints[1];
      const control2 = currentPathPoints[2];

      //console.log('control1,control2',control1,control2,this.selectedArrow.controlPoints);

      /*
      if (!this.selectedArrow.controlPoints || this.selectedArrow.controlPoints.length == 0) {
        if (!this.selectedArrow.controlPoints) this.selectedArrow.controlPoints = [];
        this.selectedArrow.controlPoints.push(control1);
        this.selectedArrow.controlPoints.push(control2);
      }
        */
      

      // 1. Add start dot
      const refElstart = container.querySelector(
          `#node-${this.selectedArrow.start.nodeId} .pointers>.pointer-${this.selectedArrow.start.pos}`) as HTMLElement;
      if (refElstart) {
          const poiterStart = this.arrowHelper.getArrowPointerByOffset(
              refElstart, container, this.selectedArrow.start.pos, this.selectedArrow.start.offset);
          const dot1 = document.createElement('div');
          dot1.id = 'dot-' + this.selectedArrow.start.nodeId;
          dot1.className = 'dot-drag-arrow';
          dot1.dataset.line = this.selectedArrow.lineId;
          dot1.dataset.position = 'start';
          container.append(dot1);
          dot1.addEventListener('mousedown', () => {             
            this.dotForDrag = dot1; 
            this.lastActionDrag = true;            
          });
          dot1.addEventListener('mouseup', (event) => {
            //console.log('click',event.target);
              this.dotForDrag = null;
              this.arrowUpdated.emit({ newData: this.selectedArrow, oldData: old, disableHistory: false });              
          });
          dot1.style.transform = `translate3d(${poiterStart.x - 20}px, ${poiterStart.y - 20}px, 0px)`;
          document.querySelector(`#node-${this.selectedArrow.start.nodeId}`).classList.add('has-selected-arrow');
          document.querySelector(`#node-${this.selectedArrow.end.nodeId}`).classList.add('has-selected-arrow');
      }

      // 2. Add end dot
      const refElend = container.querySelector(
          `#node-${this.selectedArrow.end.nodeId} .pointers>.pointer-${this.selectedArrow.end.pos}`) as HTMLElement;
      if (refElend) {
          const poiterEnd = this.arrowHelper.getArrowPointerByOffset(
              refElend, container, this.selectedArrow.end.pos, this.selectedArrow.end.offset);
          const dot2 = document.createElement('div');
          dot2.id = 'dot-' + this.selectedArrow.end.nodeId;
          dot2.dataset.line = this.selectedArrow.lineId;
          dot2.dataset.position = 'end';
          dot2.className = 'dot-drag-arrow';
          container.append(dot2);
          dot2.addEventListener('mousedown', () => { this.dotForDrag = dot2; this.lastActionDrag = true;});
          dot2.addEventListener('mouseup', (event) => {
              this.dotForDrag = null;
              this.arrowUpdated.emit({ newData: this.selectedArrow, oldData: old, disableHistory: false });
              event.stopPropagation();
          });
          dot2.style.transform = `translate3d(${poiterEnd.x - 20}px, ${poiterEnd.y - 20}px, 0px)`;

          // 3. Add start control point
          const controlPoint1 = document.createElement('div');
          controlPoint1.id = 'control1-' + this.selectedArrow.lineId;
          controlPoint1.className = 'control-drag-arrow';
          controlPoint1.dataset.line = this.selectedArrow.lineId;
          controlPoint1.dataset.position = 'control1';            
          container.append(controlPoint1);
          controlPoint1.addEventListener('mousedown', () => { 
            this.dotForDrag = controlPoint1; 
            this.lastActionDrag = true;
            let pathData = line.getAttribute('d');
            let curPathPoints = this.getPointsFromPath(pathData);
            this.currentPathPoints = curPathPoints;  
          });
          controlPoint1.addEventListener('mouseup', (event) => {
              this.dotForDrag = null;
              this.currentPathPoints = null;
              this.arrowUpdated.emit({ newData: this.selectedArrow, oldData: old, disableHistory: false });
              event.stopPropagation();
          });
          controlPoint1.style.transform = `translate3d(${control1.x - 25}px, ${control1.y - 25}px, 0px)`;

          // 4. Add end control point
          const controlPoint2 = document.createElement('div');
          controlPoint2.id = 'control2-' + this.selectedArrow.lineId;
          controlPoint2.className = 'control-drag-arrow';
          controlPoint2.dataset.line = this.selectedArrow.lineId;
          controlPoint2.dataset.position = 'control2';
          container.append(controlPoint2);
          controlPoint2.addEventListener('mousedown', () => { 
            this.dotForDrag = controlPoint2; 
            this.lastActionDrag = true;
            let pathData = line.getAttribute('d');
            let curPathPoints = this.getPointsFromPath(pathData);
            this.currentPathPoints = curPathPoints; 
          });
          controlPoint2.addEventListener('mouseup', (event) => {
              this.dotForDrag = null;
              this.currentPathPoints = null;
              this.arrowUpdated.emit({ newData: this.selectedArrow, oldData: old, disableHistory: false });
              event.stopPropagation();
          });
          controlPoint2.style.transform = `translate3d(${control2.x - 25}px, ${control2.y - 25}px, 0px)`;

          this.selectArrow.emit(this.selectedArrow);
          line.setAttribute('stroke-width', '4');
      }
  });


}

private getPointsFromPath(pathData) {
  const points = [];
  const regex = /([MLCSAZ])([^MLCSAZ]*)/gi;
  let match;

  while ((match = regex.exec(pathData)) !== null) {
    const command = match[1];
    const coordinates = match[2].trim().split(/[\s,]+/).map(Number);

    switch (command) {
      case 'M':
      case 'L':
        for (let i = 0; i < coordinates.length; i += 2) {
          if (!isNaN(coordinates[i]) && !isNaN(coordinates[i + 1])) {
            points.push({ x: coordinates[i], y: coordinates[i + 1] });
          }
        }
        break;
      case 'C':
        for (let i = 4; i < coordinates.length; i += 6) {
          if (!isNaN(coordinates[i]) && !isNaN(coordinates[i + 1])) {
            points.push({ x: coordinates[i], y: coordinates[i + 1] });
          }
        }
        break;
      case 'S':
      case 'Q':
        for (let i = 2; i < coordinates.length; i += 4) {
          if (!isNaN(coordinates[i]) && !isNaN(coordinates[i + 1])) {
            points.push({ x: coordinates[i], y: coordinates[i + 1] });
          }
        }
        break;
      case 'T':
        for (let i = 0; i < coordinates.length; i += 2) {
          if (!isNaN(coordinates[i]) && !isNaN(coordinates[i + 1])) {
            points.push({ x: coordinates[i], y: coordinates[i + 1] });
          }
        }
        break;
      case 'A':
        for (let i = 5; i < coordinates.length; i += 7) {
          if (!isNaN(coordinates[i]) && !isNaN(coordinates[i + 1])) {
            points.push({ x: coordinates[i], y: coordinates[i + 1] });
          }
        }
        break;
      case 'Z':
        if (points.length > 0) {
          points.push(points[0]); // Closing path
        }
        break;
    }
  }

  return points;
}


  public getAssetsFolder() {
    if (typeof window['assets'] !== 'undefined') {
      return window['assets'];
    } else {
      return '/';
    }
  }

  public hasCoords(position) {
    if (typeof position.x === 'number' && typeof position.y) {
      return true;
    } else {
      return false;
    }
  }

  public handleClickOnWorkspace() {
    if (this.activeArrow) {
      if (!this.activeArrow.relesed) {
        this.isDrawingArrow = false;
        if (this.activeArrow.end.nodeId &&
          !document.querySelector(`path#${this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId}`)) {
          const Arrow = {
            start: {
              x: this.activeArrow.start.x,
              y: this.activeArrow.start.y,
              nodeId: this.activeArrow.start.nodeId,
              pos: this.activeArrow.start.pos,
              offset: this.activeArrow.start.offset},
            end: {
              x: this.activeArrow.end.x,
              y: this.activeArrow.end.y,
              nodeId: this.activeArrow.end.nodeId,
              pos: this.activeArrow.end.pos,
              offset: this.activeArrow.end.offset
            },
            lineId: this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId,
            controlPoints: this.activeArrow.controlPoints,
            arrowPosition: this.activeArrow.arrowPosition,
            id: this.activeArrow.id
          };

          this.listOfArrows.push(Arrow);
          this.arrowAdded.emit({arrow: Arrow, disableHystory: false });

          const lineId = this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId;
          this.svgD3.select('path#' + this.activeArrow.lineId)
            .attr('id', lineId );

          setTimeout(() => {
             this.addHandleSelectArrow(lineId);
          }, 100);

          this.activeArrow = null;
        } else {
          this.svgD3.select('path#' + this.activeArrow.lineId).remove();
          this.activeArrow = null;
        }
      } else {
        this.activeArrow.relesed = false;
      }
    } else {    
     
     //console.log('clickOnWorkspace', this.lastActionDrag);
      if (this.lastActionDrag == false) {
        this.clickWorkspace.emit(); //last action was not dragging
      }
      this.lastActionDrag = false; //set boolean since we are evaluating mouseup
    }

  }

  public handleMouseUp() {
    if (this.selectedArrow && this.dotForDrag) {      
      this.dotForDrag = null;
      this.arrowUpdated.emit({ newData: this.selectedArrow, oldData: this.oldArrowData, disableHistory: false});
    }
  }

  public handleStartDrag(data, node) {
    const lines = this.listOfArrows.filter((item) => item.start.nodeId === node.id || item.end.nodeId === node.id );
    this.activeNode = node;
    this.startPositionNode = data.source.element.nativeElement.style.transform;
    this.connectedLines = lines;
  }

  public handleNodeMouseover(data) {
    this.mouseoverNode.emit(data.id);
  }

  public handleNodeClick(data) {
    this.clickNode.emit(data.id);
  }

  private parseTranslate(text) {
    const match = text.match(/(translate3d\()+[0-9px,\- ]+(\))/);
    const coordinats = match[0].replace(match[1], '').replace(match[2], '').split(',');

    const x = Number( coordinats[0].replace('px', '') );
    const y = Number( coordinats[1].replace('px', '') );
    return { x, y };
  }

  public handleNodeMove(evt, node) {
    this.isMoving = true;
    if (this.connectedLines.length) {
      const container = this.stackWorkFlow.nativeElement;

      let pointers = evt.event.target;
      if (!pointers.classList.contains('pointers')) {
        pointers = evt.event.target.parentNode;
      }

      const dot = container.querySelector('#dot-' + node.id) as HTMLElement;

      this.connectedLines.forEach((item) => {
        console.log('reset', item);
        item.controlPoints = []; //reset control points since we are moving node
        this.arrowHelper.updateExistedArrow(item, container,this.isMoving);
        if (dot && dot.dataset.line === item.lineId) {
          const pos = dot.dataset.position;
          dot.style.transform = `translate3d(${item[pos].x - 20}px, ${item[pos].y - 20}px, 0px)`;
        }
        /* */
      });
    }
  }

  public redrawArrows() {
   //console.log('redrawArrows',this.listOfArrows);
    const container = this.stackWorkFlow.nativeElement;
    const ids = [];
    this.listOfArrows.forEach((item) => {
      const startNode = this.nodes[item.start.nodeId];
      const endNode = this.nodes[item.end.nodeId];
      if (!startNode.hide && !endNode.hide) {
        this.arrowHelper.updateExistedArrow(item, container);
      } else {
        ids.push(item.lineId);
      }
    });
    if (ids.length > 0) {
      this.removeArrows.emit(ids);
    }
  }

  public handleMouseOverPointer(evt, node, pos) {
    if ( this.activeArrow ) {
      // console.log(evt.x, evt.y);
      const container = this.stackWorkFlow.nativeElement;
      const data = this.arrowHelper.getArrowPointer(evt.target, container, pos, { x: evt.x, y: evt.y});
      this.activeArrow.end.nodeId = node.id;
      this.activeArrow.end.x = data.pointer.x;
      this.activeArrow.end.y = data.pointer.y;
      this.activeArrow.end.offset = data.offset;
      this.activeArrow.end.pos = pos;
      this.activeArrow.end.elRef = evt.target;
      this.arrowHelper.updateExistedArrow(this.activeArrow);
      // this.isDrawingArrow = false;
    }
    /*if ( this.selectArrow && this.dotForDrag) {
      const position = this.dotForDrag.dataset.position;
      if(this.selectArrow) {

      }
    }*/
  }

  public handleMouseOutPointer() {
    if (this.activeArrow) {
      // console.log('out');
      this.activeArrow.end.nodeId = null;
      this.activeArrow.end.elRef = null;
    }
  }

  public handleAddArrowClick(evt, direction, node?) {

    //TODO
    //if there is a selectedArrow, deselect
    //Need to check this assumption

    if (!this.activeArrow) {
      const target = evt.target;
      const container = this.stackWorkFlow.nativeElement;
      this.isDrawingArrow = true;
      /* */
      this.activeArrow = this.arrowHelper.culcStartPosition(target, container, node, direction);
    }
  }

  public handleMouseMove(evt) {
    if (this.activeArrow) {      

      if (!this.activeArrow.end.nodeId) {
        const container = this.stackWorkFlow.nativeElement;
        const rectContainer = container.getBoundingClientRect();

        const X = rectContainer.x;
        const Y = rectContainer.y;

        const pos = { y: evt.y - Y - containerOffset, x: evt.x - X - containerOffset };

        this.activeArrow.end.x = pos.x;
        this.activeArrow.end.y = pos.y;
        //

        this.svgD3.select('path#' + this.activeArrow.lineId)
          .attr('d', lineGenerator([ [this.activeArrow.start.x, this.activeArrow.start.y], [pos.x, pos.y] ]));
      } else {
        const container = this.stackWorkFlow.nativeElement;
        const data = this.arrowHelper.getArrowPointer(
          this.activeArrow.end.elRef, container, this.activeArrow.end.pos, { x: evt.x, y: evt.y});
        this.activeArrow.end.x = data.pointer.x;
        this.activeArrow.end.y = data.pointer.y;
        this.activeArrow.end.offset = data.offset;
        this.arrowHelper.updateExistedArrow(this.activeArrow);
      }
    }

    

    if (this.selectedArrow && this.dotForDrag) {

      //console.log('this.dotForDrag',this.dotForDrag);

        const container = this.stackWorkFlow.nativeElement;
        const position = this.dotForDrag.dataset.position;

        //console.log('selectedArrow',this.selectedArrow);       
        
        
        if (this.selectedArrow[position]?.nodeId) {
          //console.log(this.selectedArrow[position].nodeId);

          const nodeId = this.selectedArrow[position].nodeId;
          const result = this.getPosOfNodeByPoint(nodeId, container, { x: evt.x, y: evt.y});
          const data = this.arrowHelper.getArrowPointer(
            result.el, container, result.pos, { x: evt.x, y: evt.y});

          this.selectedArrow[position].x = data.pointer.x;
          this.selectedArrow[position].y = data.pointer.y;
          this.selectedArrow[position].pos = result.pos;
          this.selectedArrow[position].offset = data.offset;
          this.arrowHelper.updateExistedArrow(this.selectedArrow);
          this.dotForDrag.style.transform = `translate3d(${data.pointer.x - 20}px, ${data.pointer.y - 20}px, 0px)`;

          this.updateControlPointPositionArrow(this.selectedArrow.lineId);
        } else if (position === 'control1' || position === 'control2') {
          //control point   
          const rectContainer = container.getBoundingClientRect();

          const X = rectContainer.x;
          const Y = rectContainer.y;

          const pos = { y: evt.y - Y - containerOffset, x: evt.x - X - containerOffset };
          //console.log(pos.x,pos.y,evt.x,evt.y);


          //this updates selectedArrow controlPoints
          //expected number of control points array length is 2

          //if control points is not set, we can set
          if (!this.selectedArrow.controlPoints) {
            this.selectedArrow.controlPoints = [];
          }

          //handle control points and any that are missing
          if (position === 'control1') {
            if (!this.selectedArrow.controlPoints[0]) {
              this.selectedArrow.controlPoints[0] = {};
            }
            this.selectedArrow.controlPoints[0].x = pos.x;
            this.selectedArrow.controlPoints[0].y = pos.y;

            //set null points if needed
            if (!this.selectedArrow.controlPoints[1]) {
              this.selectedArrow.controlPoints[1] = {x:null,y:null};
            }
          } else if (position === 'control2') {
            if (!this.selectedArrow.controlPoints[1]) {
              this.selectedArrow.controlPoints[1] = {};
            }
            this.selectedArrow.controlPoints[1].x = pos.x;
            this.selectedArrow.controlPoints[1].y = pos.y;

            //fix null points
            if (!this.selectedArrow.controlPoints[0]) {
              this.selectedArrow.controlPoints[0] = {x:null,y:null};
            }
          }

          


          //console.log('this.selectedArrow after move', this.selectedArrow);
          

          this.arrowHelper.updateExistedArrowBezier(this.selectedArrow, container, pos.x, pos.y, position, this.currentPathPoints);

          this.dotForDrag.style.transform = `translate3d(${pos.x - 25}px, ${pos.y - 25}px, 0px)`;
        }
      
    
    }
  }

  private getPosOfNodeByPoint(nodeId: string, container: HTMLElement, point: { x: number, y: number }): { el: HTMLElement, pos: string } {
    const nodeElement = container.querySelector('#node-' + nodeId );
    const rect = nodeElement.getBoundingClientRect();
    let pos = '';

    if (point.x < rect.x ||  point.x > rect.x + rect.width ) {
      if (point.x < rect.x) {
        pos = 'Left';
      } else {
        pos = 'Right';
      }
    } else {
      if (point.y > rect.y + rect.height / 2) {
        pos = 'Bottom';
      } else {
        pos = 'Top';
      }
    }

    const El = nodeElement.querySelector(`.pointer-${pos}`) as HTMLElement;
    return { el: El, pos };
  }

  public hideNodeFormStack(node: BluePrintTool) {
    const arrowsToRemove = this.listOfArrows.filter((arrow) => arrow.lineId.indexOf(node.id) !== -1 );
    //(arrowsToRemove);
    if (arrowsToRemove.length > 0) {
      const dialogRef = this.confirm.open(ConfirmActionDialogComponent, {
        width: '480px',
        data: { title: 'Hide tool',  content: 'Do you realy want to hide tool - ' + this.nodes[node.id].tool.name + '?'}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          node.hide = true;
          this.nodes[node.id].hide = true;
          this.doHideNode(node, false);
        }
      });
    } else {
      node.hide = true;
      this.doHideNode(node, false);
    }
  }

  public hideNodeGlobally(node: BluePrintTool) {
    const arrowsToRemove = this.listOfArrows.filter((arrow) => arrow.lineId.indexOf(node.id) !== -1 );
      const dialogRef = this.confirm.open(ConfirmActionDialogComponent, {
        width: '480px',
        data: { title: 'Hide tool globally',  content: 'This will hide this tool for all users: ' + this.nodes[node.id].tool.name + '. Proceed?'}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
         
          
           
          if (arrowsToRemove.length > 0) {
            node.hide = true;
            this.nodes[node.id].hide = true;
            this.doHideNode(node, true, true); 
          } else {
            node.hide = true;
            this.doHideNode(node, true, true);
          }         

        }
      });
    
  }

  doHideNode(node: BluePrintTool, disableHistory: boolean, globalHide: boolean = false) {
    const index = this.showNodes.findIndex((item) => item.id === node.id);
    if (index !== -1) {
      this.showNodes.splice(index, 1);
    }
    const arrowsToRemove = node.hide ? this.listOfArrows.filter((arrow) => arrow.lineId.indexOf(node.id) !== -1 ) : [];
    const ids = [];
    if (arrowsToRemove.length) {
      arrowsToRemove.forEach(element => {
        ids.push(element.lineId);
        const i = this.listOfArrows.findIndex(item => item.lineId ===  element.lineId );
        this.listOfArrows.splice(i, 1);
        this.svgD3.select('path#' + element.lineId).remove();
      });

      setTimeout(() => { this.removeArrows.emit(ids); }, 0);
    }
    
    if (globalHide) {
      this.hideGlobalVisibilityNode.emit({ item: node, arrows: arrowsToRemove, disableHistory: true, isHidden: false }); 
    } else {
      this.hideNode.emit({ item: node, arrows: arrowsToRemove, disableHistory });
    }

  }

  public removeSingleArrow(lineId: string) {
    const index = this.listOfArrows.findIndex((item) => item.lineId === lineId );

    if (index !== -1) {
      this.svgD3.select('path#' + this.listOfArrows[index].lineId).remove();
      this.removeArrows.emit([this.listOfArrows[index].lineId]);
      this.listOfArrows.splice(index, 1);
    }
  }

  ngAfterViewInit() {
    const container = this.stackWorkFlow.nativeElement;
    this.svgPaint.nativeElement.addEventListener('mousedown', (evt) => {
      // console.log(evt.target['id']);
      if ((evt.target === evt.currentTarget) || evt.target['id'] === 'builder_grid_rect') {
        // console.log(evt.target, evt.currentTarget);
        this.isMultiselect = true;

        this.startSelecting = true;
        this.selectorArea.nativeElement.style.display = 'block';
        this.selectorArea.nativeElement.style.visibility = 'hidden';
        const offsetParent = this.stackWorkFlow.nativeElement.offsetParent as HTMLDivElement;
        this.selectOffsetData = { x: offsetParent.offsetLeft,
          y: offsetParent.offsetTop };

        this.startPointer = { x: evt.pageX - this.selectOffsetData.x, y: evt.pageY - this.selectOffsetData.y };
        if ( this.selectedNodes.length > 0 ) {
          this.selectedNodes.forEach(item => {
            item.elRef.style.transform = `translate3d(${item.node.position.x}px, ${item.node.position.y}px, 0px)`;
            item.elRef.classList.remove('selected');
          });

          this.connectedLines.forEach((itemArrow) => {
            this.arrowHelper.updateExistedArrow(itemArrow, container);
          });

          this.selectedNodes = [];
        }

      }
    });

    this.selectMany.nativeElement.addEventListener('mousedown', (evt) => {

      this.startSelecting = true;
      this.selectorArea.nativeElement.style.display = 'block';
      const offsetParent = this.stackWorkFlow.nativeElement.offsetParent as HTMLDivElement;
      this.selectOffsetData = { x: offsetParent.offsetLeft,
        y: offsetParent.offsetTop };

      this.startPointer = { x: evt.pageX - this.selectOffsetData.x, y: evt.pageY - this.selectOffsetData.y };
      if ( this.selectedNodes.length > 0 ) {
        this.selectedNodes.forEach(item => {
          item.elRef.style.transform = `translate3d(${item.node.position.x}px, ${item.node.position.y}px, 0px)`;
          item.elRef.classList.remove('selected');
        });

        this.connectedLines.forEach((itemArrow) => {
          this.arrowHelper.updateExistedArrow(itemArrow, container);
        });

        this.selectedNodes = [];
      }

    });

    this.selectMany.nativeElement.addEventListener('mousemove', (evt) => {
      // console.log(evt);
      if (this.startSelecting) {
        const X = evt.pageX - this.selectOffsetData.x;
        const Y = evt.pageY - this.selectOffsetData.y;
        this.selectorArea.nativeElement.style.visibility = 'visible';
        // console.log(this.startPointer.x, this.startPointer.y, X, Y);

        if (this.startPointer.x > X) {
          this.selectorArea.nativeElement.style.left = X + 'px';
          this.selectorArea.nativeElement.style.width = (this.startPointer.x - X) + 'px';
        } else {
          this.selectorArea.nativeElement.style.width = (X - this.startPointer.x) + 'px';
          this.selectorArea.nativeElement.style.left = this.startPointer.x + 'px';
        }

        if (this.startPointer.y > Y) {
          this.selectorArea.nativeElement.style.top = Y + 'px';
          this.selectorArea.nativeElement.style.height = (this.startPointer.y - Y) + 'px';
        } else {
          this.selectorArea.nativeElement.style.top = this.startPointer.y + 'px';
          this.selectorArea.nativeElement.style.height = (Y - this.startPointer.y) + 'px';
        }
      }
    });

    this.selectMany.nativeElement.addEventListener('mouseup', (evt) => {
      this.startSelecting = false;
      this.selectorArea.nativeElement.style.display = 'none';

      const X = evt.pageX - this.selectOffsetData.x;
      const Y = evt.pageY - this.selectOffsetData.y;
      const area: Area = { x: 0, y: 0, width: 0, height: 0 };
      if (this.startPointer.x > X) {
        area.x = X;
        area.width = (this.startPointer.x - X);
      } else {
        area.width = (X - this.startPointer.x);
        area.x = this.startPointer.x;
      }

      if (this.startPointer.y > Y) {
        area.y = Y;
        area.height = (this.startPointer.y - Y);
      } else {
        area.y = this.startPointer.y;
        area.height = (Y - this.startPointer.y);
      }
      if (area.height > 20 || area.width > 20) {
        this.getSelectedNodes(area);
      } else {
        this.moveSelectedArea.nativeElement.style.display = 'none';
      }
      // console.log(this.selectedNodes);
      this.isMultiselect = false;
    });

    this.selectMany.nativeElement.addEventListener('mouseout', (evt) => {
      if (this.startSelecting) {
        this.startSelecting = false;
        this.selectorArea.nativeElement.style.display = 'none';
      }
    });

    this.moveSelectedArea.nativeElement.addEventListener('mousedown', (evt) => {
      this.moveSelectStart = { x: evt.pageX - this.selectOffsetData.x - containerOffset,
        y: evt.pageY - this.selectOffsetData.y - containerOffset };
      this.starMoveSelected = true;
    });
    this.moveSelectedArea.nativeElement.addEventListener('mousemove', (evt) => {
      if (this.starMoveSelected) {
        const X = evt.pageX - this.selectOffsetData.x - containerOffset;
        const Y = evt.pageY - this.selectOffsetData.y - containerOffset;
        const dx = X - this.moveSelectStart.x;
        const dy = Y - this.moveSelectStart.y;
        this.moveSelectedArea.nativeElement.style.transform = `translate3d(${dx}px, ${dy}px, 0px)`;
        this.selectedNodes.forEach((item) => {
          item.elRef.style.transform = `translate3d(${item.node.position.x + dx}px, ${item.node.position.y + dy}px, 0px)`;
        });

        this.connectedLines.forEach((itemArrow) => {
          this.arrowHelper.updateExistedArrow(itemArrow, container);
        });
      }
      //
    });
    this.moveSelectedArea.nativeElement.addEventListener('mouseup', (evt) => {
      this.starMoveSelected = false;
      const X = evt.pageX - this.selectOffsetData.x - containerOffset;
      const Y = evt.pageY - this.selectOffsetData.y - containerOffset;
      const dx = X - this.moveSelectStart.x;
      const dy = Y - this.moveSelectStart.y;
      this.completeGroupMove({ x: dx, y: dy });
    });
    this.moveSelectedArea.nativeElement.addEventListener('mouseleave', (evt) => {
      if (this.starMoveSelected) {
        this.starMoveSelected = false;
        const X = evt.pageX - this.selectOffsetData.x - containerOffset;
        const Y = evt.pageY - this.selectOffsetData.y - containerOffset;
        const dx = X - this.moveSelectStart.x;
        const dy = Y - this.moveSelectStart.y;
        this.completeGroupMove({ x: dx, y: dy });
      }
    });
  }

  private completeGroupMove(different: Pointer): void {
    this.moveSelectedArea.nativeElement.style.transform = `translate3d(0px, 0px, 0px)`;
    const y = parseInt( this.moveSelectedArea.nativeElement.style.top, 10 );
    const x = parseInt( this.moveSelectedArea.nativeElement.style.left, 10 );
    this.moveSelectedArea.nativeElement.style.top = (y + different.y) + 'px';
    this.moveSelectedArea.nativeElement.style.left = (x + different.x) + 'px';

    if (this.selectedNodes.length > 0) {
      const nodeIds: string[] = [];
      const toUpdate = this.selectedNodes.map(item => {
        // nodeIds.push(item.node.id);
        let positionX: number;
        let positionY: number;
        if (this.useSnapGrid) {
          positionX = Math.floor((item.node.position.x + different.x) / 10) * 10;
          positionY = Math.floor((item.node.position.y + different.y) / 10) * 10;
        } else {
          positionX = item.node.position.x + different.x;
          positionY = item.node.position.y + different.y;
        }

        item.node.position = { x: positionX, y: positionY };
        return { nodeId: item.node.id, position: item.node.position };
      });

      const promises = toUpdate.map(async (props) => {
        // props.disableHistory = true;
        this.positionNodeChanged.emit(Object.assign({}, props, { disableHistory: true }));
        return props;
      });

      Promise.all(promises).then((result) => {
        // console.log('position updated');
      }).catch((err) => {
        console.log(err);
      });

      if (this.connectedLines) {
        const updatedLines = this.connectedLines.map(async (item) => {
          return this.arrowUpdated.emit({ newData: item, disableHistory: true });
        });

        Promise.all(updatedLines).then(() => { /*console.log('completed update');*/ }).catch(err => console.log(err));
      }

      this.groupMoveCompleted.emit({ nodeIds, diff: different });
    }
  }

  private getSelectedNodes(area: Area): void {
    const endX = area.x + area.width;
    const endY = area.y + area.height;
    const selectedNodes = this.showNodes.filter(item => {
      const elRef = document.querySelector(`#node-${item.id}`) as HTMLDivElement;
      return item.position.x + elRef.offsetWidth > area.x - containerOffset && item.position.x < endX - containerOffset
        && item.position.y + elRef.offsetHeight > area.y - containerOffset && item.position.y < endY - containerOffset;
    });

    this.moveSelectedArea.nativeElement.style.display = 'block';
    this.moveSelectedArea.nativeElement.style.transform = `translate3d(0px, 0px, 0px)`;

    this.moveSelectedArea.nativeElement.style.top = area.y + 'px';
    this.moveSelectedArea.nativeElement.style.left = area.x + 'px';
    this.moveSelectedArea.nativeElement.style.width = area.width + 'px';
    this.moveSelectedArea.nativeElement.style.height = area.height + 'px';

    this.selectedNodes = selectedNodes.map((item) => {
      const elRef = document.querySelector(`#node-${item.id}`) as HTMLDivElement;
      elRef.classList.add('selected');
      //
      return { node: item, elRef };
    });

    const lines = this.listOfArrows.filter((itemArrow) => {
      let start = false;
      let end = false;
      // itemArrow.start.nodeId === item.id || itemArrow.end.nodeId === item.id;

      start = selectedNodes.findIndex((node) => itemArrow.start.nodeId === node.id) !== -1;
      end = selectedNodes.findIndex((node) => itemArrow.end.nodeId === node.id) !== -1;
      return start || end;
    });
    this.connectedLines = lines;
  }

  ngOnDestroy() {
    if (this.nodesSubscription) {
      this.nodesSubscription.unsubscribe();
    }

    if (this.arrowSubscription) {
      this.arrowSubscription.unsubscribe();
    }

    if (this.addedNewNodeSubcription) {
      this.addedNewNodeSubcription.unsubscribe();
    }

    if (this.historySubscription) {
      this.historySubscription.unsubscribe();
    }

    if (this.updateNodeDataSubscription) {
      this.updateNodeDataSubscription.unsubscribe();
    }

    if (this.gridSubscription) {
      this.gridSubscription.unsubscribe();
    }

    if (this.snapSubscription) {
      this.snapSubscription.unsubscribe();
    }
  }

  private deepCloneArrow(a: DrawArrow): DrawArrow {
    return JSON.parse(JSON.stringify(a));
  }

}

  /* private generatePosition( startX, endX, startY, endY ) {
    let Xpos = 'Left';
    let Ypos = '';
    const radAngle = Math.atan2(endX - startX, endY - startY);
    const degAngle = radAngle * 180 / Math.PI + 180;
    const part = 8;
    const diapason = 360 / part / 2;
    if (degAngle < diapason || degAngle > 360 - diapason || degAngle > 180 - diapason && degAngle < 180 + diapason ) { Xpos = 'Middle'; }
    if (degAngle >= diapason && degAngle <= 180 - diapason) { Xpos = 'Right'; }
    if (degAngle >= 180 + diapason && degAngle <= 360 - diapason) { Xpos = 'Left'; }
    if (degAngle < 90 - diapason || degAngle > 270 + diapason ) { Ypos = 'Bottom'; }
    if (degAngle > 90 + diapason && degAngle < 270 - diapason) { Ypos = 'Top'; }

    return { Xpos, Ypos };
  } */

  /* private redrawArrow(item, container) {
    const startBlock = container.querySelector(`#node-${item.start.nodeId}`);
    const endBlock = container.querySelector(`#node-${item.end.nodeId}`);

    if (startBlock && endBlock) {
      const startCoordiants = this.parseTranslate(startBlock.style.transform);
      const startPointerItem = startBlock.querySelector('.pointer-' + item.start.pos);

      const posStart = {
        y: startCoordiants.y + startPointerItem.offsetTop,
        x: startCoordiants.x + startPointerItem.offsetLeft
      };

      item.start.x = posStart.x;
      item.start.y = posStart.y;

      const endCoordiants = this.parseTranslate(endBlock.style.transform);
      const endPointerItem = endBlock.querySelector('.pointer-' + item.end.pos);

      const posEnd = {
        y: endCoordiants.y + endPointerItem.offsetTop,
        x: endCoordiants.x + endPointerItem.offsetLeft
      };

      item.end.x = posEnd.x;
      item.end.y = posEnd.y;

      this.svgD3.select('path#' + item.lineId)
            .attr('d', lineGenerator(this.arrowHelper.genrateDots(
              [item.start.x, item.start.y],
              [item.end.x, item.end.y], item.start.pos, item.end.pos)));
    }
  }
  */

  /*private retriveNodePosition(data, node) {
    data.source.element.nativeElement.style.transform = this.startPositionNode;
    const coordiants = this.parseTranslate(this.startPositionNode);
    console.log(data.source);
    data.source.freeDragPosition = coordiants;

    const container = this.stackWorkFlow.nativeElement;
    // data.source._dragRef._activeTransform = coordiants;
    data.source._dragRef._passiveTransform = coordiants;

    const lines = this.listOfArrows.filter((item) => item.start.nodeId === node.id || item.end.nodeId === node.id );
    lines.forEach((item) => {
      this.redrawArrow(item, container);
    });
  }*/

  /*private drawArrowOnDrag( nodeOne, nodeTwo ) {

    const container = this.stackWorkFlow.nativeElement;
    const startBlock = container.querySelector(`#node-${nodeOne.id}`);
    const endBlock = container.querySelector(`#node-${nodeTwo.id}`);

    const start = this.parseTranslate(startBlock.style.transform);
    const end = this.parseTranslate(endBlock.style.transform);

    const endpos = this.generatePosition( start.x, end.x, start.y, end.y );
    const startpos = this.generatePosition( end.x, start.x, end.y, start.y );

    const startPointerItem = startBlock.querySelector('.pointer-' + startpos.Xpos + startpos.Ypos);

    const posStart = {
      y: start.y + startPointerItem.offsetTop,
      x: start.x + startPointerItem.offsetLeft
    };

    const endPointerItem = endBlock.querySelector('.pointer-' + endpos.Xpos + endpos.Ypos);

    const posEnd = {
      y: end.y + endPointerItem.offsetTop,
      x: end.x + endPointerItem.offsetLeft
    };

    const Arrow: DrawArrow = {
      start: { x: posStart.x, y: posStart.y, nodeId: nodeOne.id, pos: startpos.Xpos + startpos.Ypos },
      end: { x: posEnd.x, y: posEnd.y, nodeId: nodeTwo.id, pos: endpos.Xpos + endpos.Ypos },
      lineId: 'line-' + nodeOne.id + '-' + nodeTwo.id
    };


    this.drawArrow(Arrow);

  } */
