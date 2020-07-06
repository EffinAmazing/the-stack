import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Tool, BluePrintTool } from '../../../../shared/models/tool';
import { DrawArrow } from '../../../../shared/models/draws-item';
import { MatDialog } from '@angular/material/dialog';
import { NodeDetailsComponent } from '../node-details/node-details.component';
import { ArrowsHelper } from '../../../../shared/helper/arrows-draw.helper';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import * as d3 from 'd3';

const containerOffset = 20;
const dotRadius = 9;
const lineGenerator = d3.line().curve(d3.curveCardinal);
const host = environment.serverURI;

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
  @ViewChild('stackWorkFlow') stackWorkFlow: ElementRef;
  @Output() positionNodeChanged: EventEmitter<any> = new EventEmitter();
  @Output() updatedNodeData: EventEmitter<any> = new EventEmitter();
  @Output() arrowAdded: EventEmitter<any> = new EventEmitter();
  @Output() arrowUpdated: EventEmitter<any> = new EventEmitter();
  @Output() hideNode: EventEmitter<any> = new EventEmitter();
  @Output() removeArrows: EventEmitter<any> = new EventEmitter();
  @Output() selectArrow: EventEmitter<any> = new EventEmitter();
  @Output() callEditNode: EventEmitter<string> = new EventEmitter();
  @Input() loadedNodes: Observable<any>;
  @Input() loadedArrows: Observable<any>;
  @Input() historyEmit: Observable<any>;
  @Input() addedNewNode: Observable<any>;
  @Input() updatedOutNodeData: Observable<any>;
  arrowHelper: ArrowsHelper = new ArrowsHelper();
  selectedArrow: any;
  nodes: BluePrintTool[] = [];
  // nodes: BluePrintTool[] = [];
  showNodes: BluePrintTool[] = [];
  listOfArrows: Array<DrawArrow> = [];
  connectedLines: Array<any> = [];
  activeArrow: DrawArrow;
  svgD3: any;
  activeNode;
  startPositionNode = '';
  hoveredNode: any;
  isMoving = false;
  oldArrowData: DrawArrow | null;
  dotForDrag: HTMLDivElement | null = null;
  disableTillDrawLine = false;

  constructor(private detailsDialog: MatDialog) {  }

  ngOnInit(): void {
    this.svgD3 = this.arrowHelper.initSvg('svg#paint');

    const offsetX = 200;
    const offsetY = 55;
    const maxItems = 5;
    const arrToChange = [];


    let index = 0;
    this.loadedNodes.subscribe((data) => {
      this.showNodes = [];
      console.log(' *** loadedNodes ****');

      if (data.list) {
        data.list.forEach((nodeId) => {
          const item = data.nodes[nodeId];
          //
          if (!item.hide) {
            if (typeof item.position.x !== 'number') {
              if (item.tool.tag === 'domain') {
                item.position.y = 0;
                item.position.x = Math.floor(maxItems / 2) * offsetX;
              } else {
                const yIndex = Math.floor(index / maxItems);
                const xIndex = (index - yIndex * maxItems);
                item.position.y = (yIndex + 1) * offsetY + Math.floor(offsetY * 0.5);
                item.position.x = xIndex * offsetX;
                window['dataLayer'].push({
                  event: 'stackbuilder.node.loaded',
                  node: item,
                  tool: item.tool
                });
              }
              arrToChange.push({nodeId: item.id, position: item.position});
              index++;
            }
            this.showNodes.push(item);
          } else {
            if (this.nodes[item.id] && this.listOfArrows.length) {
                // console.log('hidden item');
                const arrowsToRemove = this.listOfArrows.filter((arrow) => arrow.lineId.indexOf(item.id) !== -1 );
                const ids = [];
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

        const promises = arrToChange.map(async (props) => {
          props.disableHistory = true;
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

    this.loadedArrows.subscribe((list) => {
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

          this.listOfArrows.push(item);
          this.svgD3.append('path')
          .attr('id', item.lineId)
          .attr('class', 'line')
          .attr('d', lineGenerator(this.arrowHelper.genrateDots(
            [item.start.x, item.start.y],
            [item.end.x, item.end.y], item.start.pos, item.end.pos)))
          .attr('stroke', '#1c57a4')
          .attr('stroke-width', 2)
          .attr('fill', 'transparent')
          .attr('marker-end', 'url(#arrow-marker)');

          this.addHandleSelectArrow(item.lineId);
        }

        setTimeout(() => { this.redrawArrows(); }, 100);

      });
    });

    this.historyEmit.subscribe((result) => {
      // console.log(result);
      if (result) {
        const container = this.stackWorkFlow.nativeElement;
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
                  this.arrowHelper.updateExistedArrow(item, container);
                });
              }, 100);

            this.positionNodeChanged.emit({ nodeId: result.action.data.nodeId,
              position: this.nodes[result.action.data.nodeId].position, disableHistory: true  });
            break;

          case 'hideNode':
            const j = this.showNodes.findIndex((item) => item.id === result.action.data.nodeId);
            if (result.undo) {
              if (j === -1) {
                this.showNodes.push(result.action.data);
              }
            } else {
              this.showNodes.splice(j, 1);
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
            console.log(result);
            if (result.undo) {
              const k = this.listOfArrows.findIndex((item) => item.lineId === result.action.data.oldData.lineId);
              this.listOfArrows.splice(k, 1, result.action.data.oldData);
              this.arrowHelper.updateExistedArrow(result.action.data.oldData);
            } else {
              const k = this.listOfArrows.findIndex((item) => item.lineId === result.action.data.newData.lineId);
              this.listOfArrows.splice(k, 1, result.action.data.newData);
              this.arrowHelper.updateExistedArrow(result.action.data.newData);
            }
            break;
        }
      }
    });

    this.addedNewNode.subscribe(res => {
      const start = 10;
      if (res) {
        res.forEach((item, index) => {
          const existNode = this.showNodes.find(node => node.id === item.id);
          if (!existNode) {
            item.hide = false;
            if (typeof item.position.x !== 'number') {
              item.position.y = 0;
              const yIndex = Math.floor(index / maxItems);
              let xIndex = (index - yIndex * maxItems);
              if (xIndex === Math.floor(maxItems / 2) && yIndex === 0) {
                xIndex++;
              }
              item.position.y = (start - yIndex) * offsetY + Math.floor(offsetY * 0.5);
              item.position.x = xIndex * offsetX;
            }

            this.showNodes.push(item);
          }
        });
        /* */
      }
    });

    this.updatedOutNodeData.subscribe((node) => {
      // console.log(' *** updatedOutNodeData *** ', node);
    });
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


    prevArr.forEach(item => {
      if ( nextArr.indexOf( item ) === -1) {
        removed.push(item);
      }
    });

    nextArr.forEach(item => {
      if (prevArr.length === 0 || prevArr.indexOf(item) === -1) {
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
      data: { node }
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

          console.log('result.owner', result.owner, node.owner );
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

          // console.log('result.trainedOn', result.trainedOn, node.trainedOn );
          if ( result.trainedOn !==  node.trainedOn) {
            const usersUpdates = this.getAddedAndRemovedItems(node.trainedOn ? node.trainedOn.split(',') : [],
              result.trainedOn.split(','));
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
      this.positionNodeChanged.emit({ nodeId: node.id, position: data.source._dragRef._activeTransform  });
      this.nodes[node.id].position = data.source._dragRef._activeTransform;

      const updatedLines = this.connectedLines.map(async (item) => {
        return this.arrowUpdated.emit({ newData: item, disableHistory: true });
      });

      Promise.all(updatedLines).then(() => { console.log('completed update'); }).catch(err => console.log(err));

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
            [Arrow.end.x, Arrow.end.y], Arrow.start.pos, Arrow.end.pos)))
          .attr('stroke', '#1c57a4')
          .attr('stroke-width', 2)
          .attr('fill', 'transparent')
          .attr('marker-end', 'url(#arrow-marker)');

    setTimeout(() => {
      // const line = document.querySelector(`path#${Arrow.lineId}`);
      this.addHandleSelectArrow(Arrow.lineId);
    }, 100);

    this.arrowAdded.emit(Arrow);
  }

  public addHandleSelectArrow(ArrowId: string): void {
    const line = document.querySelector(`path#${ArrowId}`);
    line.addEventListener('click', () => {
      const container = this.stackWorkFlow.nativeElement;
      if (this.selectedArrow) {
        this.svgD3.select('path#' + this.selectedArrow.lineId).attr('stroke-width', 2);
        const adot1 = container.querySelector(`#dot-${this.selectedArrow.start.nodeId}`);
        if (adot1) { adot1.remove(); }
        const adot2 = container.querySelector(`#dot-${this.selectedArrow.end.nodeId}`);
        if (adot2) { adot2.remove(); }
      }
      //
      this.selectedArrow = this.listOfArrows.find((arrow) => arrow.lineId === ArrowId );
      const old = this.oldArrowData = Object.assign({}, this.selectedArrow);
      // 1. add start dot
      const refElstart = container.querySelector(
        `#node-${this.selectedArrow.start.nodeId} .pointers>.pointer-${this.selectedArrow.start.pos}`) as HTMLElement;
      if (refElstart ) {
        const poiterStart = this.arrowHelper.getArrowPointerByOffset(
          refElstart, container, this.selectedArrow.start.pos, this.selectedArrow.start.offset);
        const dot1 = document.createElement('div');
        dot1.id = 'dot-' + this.selectedArrow.start.nodeId;
        dot1.className = 'dot-drag-arrow';
        dot1.dataset.line = this.selectedArrow.lineId;
        dot1.dataset.position = 'start';
        container.append(dot1);
        dot1.addEventListener('mousedown', () => { this.dotForDrag = dot1; });
        dot1.addEventListener('mouseup', () => {
          this.dotForDrag = null;
          this.arrowUpdated.emit({ newData: this.selectedArrow, oldData: old, disableHistory: false});
        });
        dot1.style.transform = `translate3d(${poiterStart.x}px, ${poiterStart.y}px, 0px)`;
      } else {
        console.log(`#node-${this.selectedArrow.start.nodeId} .pointers>.pointer-${this.selectedArrow.start.pos}`);
      }

      // 2. add end dot
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
        dot2.addEventListener('mousedown', () => { this.dotForDrag = dot2; });
        dot2.addEventListener('mouseup', () => {
          this.dotForDrag = null;
          this.arrowUpdated.emit({ newData: this.selectedArrow, oldData: old, disableHistory: false});
        });
        dot2.style.transform = `translate3d(${poiterEnd.x}px, ${poiterEnd.y}px, 0px)`;

        this.selectArrow.emit(this.selectedArrow);
        line.setAttribute('stroke-width', '4');
      } else {
        console.log(`#node-${this.selectedArrow.end.nodeId} .pointers>.pointer-${this.selectedArrow.end.pos}`);
      }
    });
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
            lineId: this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId
          };

          this.listOfArrows.push(Arrow);
          this.arrowAdded.emit(Arrow);

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

      const dot = container.querySelector('#dot-' + node.id);

      this.connectedLines.forEach((item) => {
        this.arrowHelper.updateExistedArrow(item, container);
        if (dot && dot.dataset.line === item.lineId) {
          const pos = dot.dataset.position;
          dot.style.transform = `translate3d(${item[pos].x}px, ${item[pos].y}px, 0px)`;
        }
        /* */
      });
    }
  }

  public redrawArrows() {
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
      console.log(evt.x, evt.y);
      const container = this.stackWorkFlow.nativeElement;
      const data = this.arrowHelper.getArrowPointer(evt.target, container, pos, { x: evt.x, y: evt.y});
      this.activeArrow.end.nodeId = node.id;
      this.activeArrow.end.x = data.pointer.x;
      this.activeArrow.end.y = data.pointer.y;
      this.activeArrow.end.offset = data.offset;
      this.activeArrow.end.pos = pos;
      this.activeArrow.end.elRef = evt.target;
      this.arrowHelper.updateExistedArrow(this.activeArrow);
    }
    /*if ( this.selectArrow && this.dotForDrag) {
      const position = this.dotForDrag.dataset.position;
      if(this.selectArrow) {

      }
    }*/
  }

  public handleMouseOutPointer() {
    if (this.activeArrow) {
      console.log('out');
      this.activeArrow.end.nodeId = null;
      this.activeArrow.end.elRef = null;
    }
  }

  public handleAddArrowClick(evt, direction, node?) {
    if (!this.activeArrow) {
      const target = evt.target;
      const container = this.stackWorkFlow.nativeElement;
      /* */
      this.activeArrow = this.arrowHelper.culcStartPosition(target, container, node, direction);
    }
  }

  public handleMouseMove(evt) {
    //
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
      const container = this.stackWorkFlow.nativeElement;
      const position = this.dotForDrag.dataset.position;
      const nodeId = this.selectedArrow[position].nodeId;
      const result = this.getPosOfNodeByPoint(nodeId, container, { x: evt.x, y: evt.y});
      const data = this.arrowHelper.getArrowPointer(
        result.el, container, result.pos, { x: evt.x, y: evt.y});

      this.selectedArrow[position].x = data.pointer.x;
      this.selectedArrow[position].y = data.pointer.y;
      this.selectedArrow[position].pos = result.pos;
      this.selectedArrow[position].offset = data.offset;
      this.arrowHelper.updateExistedArrow(this.selectedArrow);
      this.dotForDrag.style.transform = `translate3d(${data.pointer.x}px, ${data.pointer.y}px, 0px)`;
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

  public hideNodeFormStack(node) {

    this.nodes[node.id].hide = true;
    const index = this.showNodes.findIndex((item) => item.id === node.id);
    if (index !== -1) {
      this.showNodes.splice(index, 1);
    }
    const arrowsToRemove = this.listOfArrows.filter((arrow) => arrow.lineId.indexOf(node.id) !== -1 );
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
    this.hideNode.emit({ item: node, disableHistory: false });
  }

  public removeSingleArrow(lineId: string) {
    const index = this.listOfArrows.findIndex((item) => item.lineId === lineId );

    if (index !== -1) {
      this.svgD3.select('path#' + this.listOfArrows[index].lineId).remove();
      this.removeArrows.emit([this.listOfArrows[index].lineId]);
      this.listOfArrows.splice(index, 1);
    }
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
