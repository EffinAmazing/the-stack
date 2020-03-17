import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Tool, BluePrintTool } from '../../../../shared/models/tool';
import { Observable } from 'rxjs';
import * as d3 from 'd3';

const containerOffset = 20;
const dotRadius = 9;
const lineGenerator = d3.line().curve(d3.curveCardinal);

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
  @ViewChild('stackWorkFlow') stackWorkFlow: ElementRef;
  @Output() positionNodeChanged: EventEmitter<any> = new EventEmitter();
  @Input() loadedNodes: Observable<any>;

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

  constructor() { }

  ngOnInit(): void {
    this.svgD3 = d3.select('svg#paint');

    const offsetX = 200;
    const offsetY = 60;
    const maxItems = 5;
    let arrToChange = [];

    let index = 0;
    this.loadedNodes.subscribe((data) => {
      this.nodes = [];
      this.showNodes = [];
      console.log(data);
      if (data.list) {
        data.list.forEach((nodeId) => {
          const item = data.nodes[nodeId];
          this.nodes.push(item);
          if (!item.hide) {
            if (typeof item.position.x !== 'number') {
              const yIndex = Math.floor(index / maxItems);
              const xIndex = (index - yIndex * maxItems);
              item.position.y = yIndex * offsetY;
              item.position.x = xIndex * offsetX;
              arrToChange.push({nodeId: item.id, position: item.position});
              index++;
            }
            console.log(item.position);
            this.showNodes.push(item);
          }
        });

        const promises = arrToChange.map(async (props) => {
          this.positionNodeChanged.emit(props);
          return props;
        });

        Promise.all(promises).then((result) => {
          console.log(result);
        }).catch((err) => {
          console.log(err);
        });
      }
    });
  }

  public relisedMove(data, node: BluePrintTool) {
    console.log(data.source._dragRef._activeTransform);

    /*  */

    this.positionNodeChanged.emit({ nodeId: node.id, position: data.source._dragRef._activeTransform  });

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
        if (this.activeArrow.end.nodeId) {
          this.listOfArrows.push({
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
          });

          this.svgD3.select('path#' + this.activeArrow.lineId).attr('id', this.activeArrow.lineId + '-' + this.activeArrow.end.nodeId );

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
    this.connectedLines = lines;
  }

  public handleNodeMove(evt, node) {
    if (this.connectedLines.length) {
      const container = this.stackWorkFlow.nativeElement;

      const rectContainer = container.getBoundingClientRect();

      const X = rectContainer.x;
      const Y = rectContainer.y;
      let pointers = evt.event.target;
      if (!pointers.classList.contains('pointers')) {
        pointers = evt.event.target.parentNode;
      }
      console.log(this.connectedLines);
      this.connectedLines.forEach((item) => {
        let offsetX = dotRadius;
        if (item.start.nodeId ===  node.id) {
          const rect = pointers.querySelector('.pointer-' + item.start.pos).getBoundingClientRect();
          const pos = {
            y: rect.y - Y - containerOffset + dotRadius,
            x: rect.x - X - containerOffset + dotRadius
          };

          item.start.x = pos.x;
          item.start.y = pos.y;

          this.svgD3.select('path#' + item.lineId)
            .attr('d', lineGenerator(this.genrateDots(
              [item.start.x, item.start.y],
              [item.end.x, item.end.y])));
        }

        if (item.end.nodeId ===  node.id) {
          const rect = pointers.querySelector('.pointer-' + item.end.pos).getBoundingClientRect();

          if (item.end.pos === 'Left') { offsetX = dotRadius / 2; }
          if (item.end.pos === 'Right') { offsetX = dotRadius * 2; }
          const pos = {
            y: rect.y - Y - containerOffset + dotRadius,
            x: rect.x - X - containerOffset + offsetX
          };

          item.end.x = pos.x;
          item.end.y = pos.y;

          this.svgD3.select('path#' + item.lineId)
            .attr('d', lineGenerator(this.genrateDots(
              [item.start.x, item.start.y],
              [item.end.x, item.end.y], item.end.pos !== 'Left' || item.end.pos !== 'Right' ? 'Top' : '')));
        }
      });
    }
  }

  public handleMouseOverNode(evt, node) {
    if (this.activeArrow) {
      console.log('over', evt, node);
      const container = this.stackWorkFlow.nativeElement;
      const rectContainer = container.getBoundingClientRect();

      const X = rectContainer.x;
      const Y = rectContainer.y;
      let Xpos = 'Left';
      let Ypos = '';
      const x1 = evt.x - X - 15;
      const y1 = evt.y - Y - 15;
      const radAngle = Math.atan2(x1 - this.activeArrow.start.x, y1 - this.activeArrow.start.y);
      console.log(x1, y1, radAngle, radAngle * 180 / Math.PI + 180);
      const degAngle = radAngle * 180 / Math.PI + 180;
      const part = 8;
      const diapason = 360 / part / 2;
      if (degAngle < diapason || degAngle > 360 - diapason || degAngle > 180 - diapason && degAngle < 180 + diapason ) { Xpos = 'Middle'; }
      if (degAngle >= diapason && degAngle <= 180 - diapason) { Xpos = 'Right'; }
      if (degAngle >= 180 + diapason && degAngle <= 360 - diapason) { Xpos = 'Left'; }
      if (degAngle < 90 - diapason || degAngle > 270 + diapason ) { Ypos = 'Bottom'; }
      if (degAngle > 90 + diapason && degAngle < 270 - diapason) { Ypos = 'Top'; }
      console.log(Xpos, Ypos, degAngle);
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
    console.log(diffX, diffY);

    arr.push([ start[0] + diffX * 0.35, start[1] + diffY * 0.15]);
    if (typeof Ypos === 'string' && Ypos !== '') {
      arr.push([ start[0] + diffX * 0.90, start[1] + diffY * 0.65]);
    } else {
      arr.push([ start[0] + diffX * 0.70, start[1] + diffY * 0.85]);
    }

    console.log(arr);
    arr.push(end);
    return arr;
  }

  public handleMouseOutNode(evt, node) {
    // console.log('out', evt, node);
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
      console.log(container);

      const pos = {
        y: rect.y - Y - containerOffset + dotRadius,
        x: rect.x - X - containerOffset + dotRadius
      };

      console.log(pos, direction);
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
    // console.log(this.activeArrow);
    if (this.activeArrow) {
      console.log('move');
      if (!this.activeArrow.end.nodeId) {
        const container = this.stackWorkFlow.nativeElement;
        const rectContainer = container.getBoundingClientRect();

        const X = rectContainer.x;
        const Y = rectContainer.y;

        const pos = { y: evt.y - Y - containerOffset, x: evt.x - X - containerOffset };

        this.activeArrow.end.x = pos.x;
        this.activeArrow.end.y = pos.y;
        console.log(lineGenerator([ [this.activeArrow.start.x, this.activeArrow.start.y], [pos.x, pos.y] ]));

        this.svgD3.select('path#' + this.activeArrow.lineId)
          .attr('d', lineGenerator([ [this.activeArrow.start.x, this.activeArrow.start.y], [pos.x, pos.y] ]));
      }
    }
  }

}
