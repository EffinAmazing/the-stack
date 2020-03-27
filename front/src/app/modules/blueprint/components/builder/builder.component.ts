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
  @Input() loadedNodes: Observable<any>;
  @Input() loadedArrows: Observable<any>;
  @Input() historyEmit: Observable<any>;
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

  constructor(private detailsDialog: MatDialog) { }

  ngOnInit(): void {
    this.svgD3 = this.arrowHelper.initSvg('svg#paint');

    const offsetX = 200;
    const offsetY = 55;
    const maxItems = 5;
    const arrToChange = [];


    let index = 0;
    this.loadedNodes.subscribe((data) => {
      this.showNodes = [];

      if (data.list) {
        console.log("data.list");
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

          const lines = document.querySelectorAll('path.line');
          lines.forEach((line) => {
            line.addEventListener('click', () => {
              if (this.selectedArrow) {
                this.svgD3.select('path#' + this.selectedArrow.lineId).attr('stroke-width', 2);
              }

              this.selectedArrow = this.listOfArrows.find((arrow) => arrow.lineId === line.id );
              this.selectArrow.emit(this.selectedArrow);
              line.setAttribute('stroke-width', '4');
            });
          });
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
                  this.redrawArrow(item, container);
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
              setTimeout(() => this.redrawArrow(result.action.data, container), 100);
            }
            break;
          case 'removeArrow':
            if (result.undo) {
              this.drawArrow(result.action.data);
              setTimeout(() => this.redrawArrow(result.action.data, container), 100);
            } else {
              this.removeSingleArrow(result.action.data.lineId);
            }
            break;
        }
      }
    });

  }

  public processImageSrc(link) {
    if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1 ) {
      return link;
    } else {
      return host + link;
    }
  }

  public handleClick(node) {

    const dialogRef = this.detailsDialog.open(NodeDetailsComponent, {
      width: '820px',
      data: { node }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        node = Object.assign({}, node, result);
        this.nodes[node.id] = node;
        const index = this.showNodes.findIndex((item) => item.id === node.id );
        this.showNodes[index] = node;
        this.updatedNodeData.emit({ nodeId: node.id, data: result });
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

      const updatedLines = this.connectedLines.map(async (item) => {
        return this.arrowUpdated.emit(item);
      });

      Promise.all(updatedLines).then(() => { console.log('completed update'); }).catch(err => console.log(err));

      this.connectedLines = [];
    // }
  }

  private drawArrowOnDrag( nodeOne, nodeTwo ) {

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
    /*   */
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
      const line = document.querySelector(`path#${Arrow.lineId}`);
      line.addEventListener('click', () => {
        if (this.selectedArrow) {
          this.svgD3.select('path#' + this.selectedArrow.lineId).attr('stroke-width', 2);
        }

        this.selectedArrow = this.listOfArrows.find((arrow) => arrow.lineId === line.id );
        this.selectArrow.emit(this.selectedArrow);
        line.setAttribute('stroke-width', '4');
      });
    }, 100);

    this.arrowAdded.emit(Arrow);
  }

  public getAssetsFolder() {
    if (typeof window['assets'] !== 'undefined') {
      return window['assets'];
    } else {
      return '/';
    }
  }

  private retriveNodePosition(data, node) {
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
        if (this.activeArrow.end.nodeId && !document.querySelector(`path#${this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId}`)) {
          const Arrow = {
            start: {
              x: this.activeArrow.start.x,
              y: this.activeArrow.start.y,
              nodeId: this.activeArrow.start.nodeId,
              pos: this.activeArrow.start.pos },
            end: {
              x: this.activeArrow.end.x,
              y: this.activeArrow.end.y,
              nodeId: this.activeArrow.end.nodeId,
              pos: this.activeArrow.end.pos
            },
            lineId: this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId
          };

          this.listOfArrows.push(Arrow);
          this.arrowAdded.emit(Arrow);

          this.svgD3.select('path#' + this.activeArrow.lineId).attr('id', this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId );

          const line = document.querySelector(`path#${this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId}`);
          line.addEventListener('click', () => {
            if (this.selectedArrow) {
              this.svgD3.select('path#' + this.selectedArrow.lineId).attr('stroke-width', 2);
            }

            this.selectedArrow = this.listOfArrows.find((arrow) => arrow.lineId === line.id );
            this.selectArrow.emit(this.selectedArrow);
            line.setAttribute('stroke-width', '4');
          });

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

      const block = container.querySelector(`#node-${this.activeNode.id}`);

      const coordiants = this.parseTranslate(block.style.transform);

      let pointers = evt.event.target;
      if (!pointers.classList.contains('pointers')) {
        pointers = evt.event.target.parentNode;
      }
      //
      this.connectedLines.forEach((item) => {
        let offsetX = dotRadius;
        if (item.start.nodeId ===  node.id) {
          const pointerItem = block.querySelector('.pointer-' + item.start.pos);

          const pos = {
            y: coordiants.y + pointerItem.offsetTop,
            x: coordiants.x + pointerItem.offsetLeft
          };

          item.start.x = pos.x;
          item.start.y = pos.y;

          this.svgD3.select('path#' + item.lineId)
            .attr('d', lineGenerator(this.arrowHelper.genrateDots(
              [item.start.x, item.start.y],
              [item.end.x, item.end.y], item.start.pos, item.end.pos)));
        }

        if (item.end.nodeId ===  node.id) {
          const pointerItem = block.querySelector('.pointer-' + item.end.pos);

          if (item.end.pos === 'Left') { offsetX = dotRadius / 2; }
          if (item.end.pos === 'Right') { offsetX = dotRadius * 2; }
          const pos = {
            y: coordiants.y + pointerItem.offsetTop,
            x: coordiants.x + pointerItem.offsetLeft
          };

          item.end.x = pos.x;
          item.end.y = pos.y;

          this.svgD3.select('path#' + item.lineId)
            .attr('d', lineGenerator(this.arrowHelper.genrateDots(
              [item.start.x, item.start.y],
              [item.end.x, item.end.y], item.start.pos, item.end.pos)));
        }
      });
    }
  }

  public redrawArrows() {
    const container = this.stackWorkFlow.nativeElement;
    this.listOfArrows.forEach((item) => {
      this.redrawArrow(item, container);
    });
  }

  private redrawArrow(item, container) {
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

  private generatePosition( startX, endX, startY, endY ) {
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
  }

  public handleMouseOverNode(evt, node) {
    this.hoveredNode = node;
    if (this.activeArrow) {
      // console.log(this.activeArrow);
      const container = this.stackWorkFlow.nativeElement;
      const rectContainer = container.getBoundingClientRect();

      const X = rectContainer.x;
      const Y = rectContainer.y;
      const x1 = evt.x - X - 15;
      const y1 = evt.y - Y - 15;

      const { Xpos, Ypos } = this.generatePosition(this.activeArrow.start.x, x1, this.activeArrow.start.y, y1);
      /* */

      const rect = evt.target.querySelector('.pointers .pointer-' + Xpos + Ypos).getBoundingClientRect();
      this.activeArrow.end.nodeId = node.id;
      this.activeArrow.end.elRef = evt.target;
      this.activeArrow.end.pos = Xpos + Ypos;
      let offsetX = dotRadius;
      if ( Xpos + Ypos === 'Right') { offsetX = dotRadius * 2; }
      if ( Xpos + Ypos === 'Left') { offsetX = dotRadius / 2; }
      const pos = {
        y: rect.y - Y - containerOffset,
        x: rect.x - X - containerOffset
      };

      this.activeArrow.end.x = pos.x;
      this.activeArrow.end.y = pos.y;

      this.svgD3.select('path#' + this.activeArrow.lineId)
        .attr('d', lineGenerator(this.arrowHelper.genrateDots(
          [this.activeArrow.start.x, this.activeArrow.start.y],
          [this.activeArrow.end.x, this.activeArrow.end.y], this.activeArrow.start.pos, this.activeArrow.end.pos)));

    }
  }

  public handleMouseOutNode(evt, node) {
    // 
    this.hoveredNode = null;
    if (this.activeArrow) {
      this.activeArrow.end.nodeId = null;
      this.activeArrow.end.elRef = null;
    }
  }

  public handleAddArrowClick(evt, direction, node?) {
    if (!this.activeArrow) {
      const target = evt.target;
      const container = this.stackWorkFlow.nativeElement;
      const rect = target.getBoundingClientRect();
      const rectContainer = container.getBoundingClientRect();

      const X = rectContainer.x;
      const Y = rectContainer.y;

      const pos = {
        y: rect.y - Y - containerOffset,
        x: rect.x - X - containerOffset
      };

      this.activeArrow = {
        start: { nodeId: node.id, x: pos.x, y: pos.y, pos: direction },
        end: { x: pos.x, y: pos.y },
        lineId: 'line-' + node.id,
        relesed: true
      };

      this.svgD3.append('path')
        .attr('id', 'line-' + node.id)
        .attr('class', 'line')
        .attr('d', lineGenerator([ [pos.x, pos.y], [pos.x + 20, pos.y + 20] ]))
        .attr('stroke', '#1c57a4')
        .attr('stroke-width', 2)
        .attr('fill', 'transparent')
        .attr('marker-end', 'url(#arrow-marker)');
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
      }
    }
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
