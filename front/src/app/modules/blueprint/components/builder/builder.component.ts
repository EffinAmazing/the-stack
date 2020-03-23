import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Tool, BluePrintTool } from '../../../../shared/models/tool';
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
  @Output() arrowAdded: EventEmitter<any> = new EventEmitter();
  @Output() arrowUpdated: EventEmitter<any> = new EventEmitter();
  @Output() hideNode: EventEmitter<any> = new EventEmitter();
  @Output() removeArrows: EventEmitter<any> = new EventEmitter();
  @Output() selectArrow: EventEmitter<any> = new EventEmitter();
  @Input() loadedNodes: Observable<any>;
  @Input() loadedArrows: Observable<any>;
  selectedArrow: any;
  nodes: BluePrintTool[] = [];
  // nodes: BluePrintTool[] = [];
  showNodes: BluePrintTool[] = [];
  listOfArrows: Array<{
    start: { nodeId: string, x: number, y: number, pos?: string },
    end: { nodeId: string, x: number, y: number, pos?: string },
    lineId: string
  }> = [];
  connectedLines: Array<any> = [];
  activeArrow: {
    start: { nodeId: string, x: number, y: number, elRef?: any, pos?: string  },
    end: { x: number, y: number, nodeId?: string, elRef?: any, pos?: string  },
    lineId: string,
    relesed: boolean
  };
  svgD3: any;
  activeNode;

  constructor() { }

  ngOnInit(): void {
    this.svgD3 = d3.select('svg#paint');

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
          // this.nodes.push(item);

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
          .attr('d', lineGenerator(this.genrateDots(
            [item.start.x, item.start.y],
            [item.end.x, item.end.y])))
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

      });
    });

  }

  public processImageSrc(link) {
    if (link.indexOf('http://') !== -1 || link.indexOf('https://') !== -1 ) {
      return link;
    } else {
      return host + link;
    }
  }

  public relisedMove(data, node: BluePrintTool) {

    /*  */

    this.positionNodeChanged.emit({ nodeId: node.id, position: data.source._dragRef._activeTransform  });

    const updatedLines = this.connectedLines.map(async (item) => {
      return this.arrowUpdated.emit(item);
    });

    Promise.all(updatedLines).then(() => { console.log('completed update'); }).catch(err => console.log(err));

    this.connectedLines = [];

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

  public handleStartDrag(node) {
    const lines = this.listOfArrows.filter((item) => item.start.nodeId === node.id || item.end.nodeId === node.id );
    this.activeNode = node;
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
    if (this.connectedLines.length) {
      const container = this.stackWorkFlow.nativeElement;

      const block = container.querySelector(`#node-${this.activeNode.id}`);

      const coordiants = this.parseTranslate(block.style.transform);

      const rectContainer = container.getBoundingClientRect();

      const X = rectContainer.x;
      const Y = rectContainer.y;

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
            y: coordiants.y + pointerItem.offsetTop + 8,
            x: coordiants.x + pointerItem.offsetLeft + 8
          };

          item.start.x = pos.x;
          item.start.y = pos.y;

          this.svgD3.select('path#' + item.lineId)
            .attr('d', lineGenerator(this.genrateDots(
              [item.start.x, item.start.y],
              [item.end.x, item.end.y])));
        }

        if (item.end.nodeId ===  node.id) {
          const pointerItem = block.querySelector('.pointer-' + item.end.pos);

          if (item.end.pos === 'Left') { offsetX = dotRadius / 2; }
          if (item.end.pos === 'Right') { offsetX = dotRadius * 2; }
          const pos = {
            y: coordiants.y + pointerItem.offsetTop + 8,
            x: coordiants.x + pointerItem.offsetLeft + 8
          };

          item.end.x = pos.x;
          item.end.y = pos.y;

          this.svgD3.select('path#' + item.lineId)
            .attr('d', lineGenerator(this.genrateDots(
              [item.start.x, item.start.y],
              [item.end.x, item.end.y], item.end.pos !== 'Left' && item.end.pos !== 'Right' ? 'Top' : '')));
        }
      });
    }
  }

  public handleMouseOverNode(evt, node) {
    if (this.activeArrow) {

      console.log(this.activeArrow);
      const container = this.stackWorkFlow.nativeElement;
      const rectContainer = container.getBoundingClientRect();

      const X = rectContainer.x;
      const Y = rectContainer.y;
      let Xpos = 'Left';
      let Ypos = '';
      const x1 = evt.x - X - 15;
      const y1 = evt.y - Y - 15;
      const radAngle = Math.atan2(x1 - this.activeArrow.start.x, y1 - this.activeArrow.start.y);
      const degAngle = radAngle * 180 / Math.PI + 180;
      const part = 8;
      const diapason = 360 / part / 2;
      if (degAngle < diapason || degAngle > 360 - diapason || degAngle > 180 - diapason && degAngle < 180 + diapason ) { Xpos = 'Middle'; }
      if (degAngle >= diapason && degAngle <= 180 - diapason) { Xpos = 'Right'; }
      if (degAngle >= 180 + diapason && degAngle <= 360 - diapason) { Xpos = 'Left'; }
      if (degAngle < 90 - diapason || degAngle > 270 + diapason ) { Ypos = 'Bottom'; }
      if (degAngle > 90 + diapason && degAngle < 270 - diapason) { Ypos = 'Top'; }
      /* */

      const rect = evt.target.querySelector('.pointers .pointer-' + Xpos + Ypos).getBoundingClientRect();
      this.activeArrow.end.nodeId = node.id;
      this.activeArrow.end.elRef = evt.target;
      this.activeArrow.end.pos = Xpos + Ypos;
      let offsetX = dotRadius;
      if ( Xpos + Ypos === 'Right') { offsetX = dotRadius * 2; }
      if ( Xpos + Ypos === 'Left') { offsetX = dotRadius / 2; }
      const pos = {
        y: rect.y - Y - containerOffset + dotRadius,
        x: rect.x - X - containerOffset + offsetX
      };

      this.activeArrow.end.x = pos.x;
      this.activeArrow.end.y = pos.y;

      this.svgD3.select('path#' + this.activeArrow.lineId)
        .attr('d', lineGenerator(this.genrateDots(
          [this.activeArrow.start.x, this.activeArrow.start.y],
          [this.activeArrow.end.x, this.activeArrow.end.y], Ypos)));

    }
  }

  private genrateDots(start, end, Ypos?) {
    const arr = [start];
    const diffX = end[0] - start[0];
    const diffY = end[1] - start[1];

    arr.push([ start[0] + diffX * 0.35, start[1] + diffY * 0.15]);
    if (typeof Ypos === 'string' && Ypos !== '') {
      arr.push([ start[0] + diffX * 0.90, start[1] + diffY * 0.65]);
    } else {
      arr.push([ start[0] + diffX * 0.70, start[1] + diffY * 0.85]);
    }
    arr.push(end);
    return arr;
  }

  public handleMouseOutNode(evt, node) {
    // 
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
        y: rect.y - Y - containerOffset + dotRadius,
        x: rect.x - X - containerOffset + dotRadius
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
    this.hideNode.emit(node);
  }

}
