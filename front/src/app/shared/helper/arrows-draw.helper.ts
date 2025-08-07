


import * as d3 from 'd3';
import { DrawArrow } from '../models/draws-item';
import { BluePrintTool } from '../../shared/models/tool';
import { Container } from '@angular/compiler/src/i18n/i18n_ast';
// const lineGenerator = d3.line().curve(d3.curveCardinal);
const dotRadius = 5;
const offsetContainer = 0;

export class ArrowsHelper {
    private SVG: any;
    public lineGenerator: any;

    constructor() {
        this.lineGenerator = d3.line().curve(d3.curveCardinal);
    }

    public initSvg(selector: string): any {
        this.SVG = d3.select(selector);
        return this.SVG;
    }

    //TODO
    //add default param controlPoints = []
    //to enable support for saved controlPoints

    public genrateDots(start, end, StartPos?, EndPos?, controlPoints?, isDragging?, arrowPosition = 'start') {
        if (isDragging) console.log('isDragging');
        const arr = [];
        let cpArr = [];

        if (controlPoints && controlPoints.length > 0) {
            const diffX = end[0] - start[0];
            const diffY = end[1] - start[1];

            cpArr = controlPoints.map((item, index) => {
                let defaultX: number;
                let defaultY: number;

                if (index === 0) {
                    defaultX = (StartPos === 'Left' || StartPos === 'Right') ? start[0] + diffX * 0.35 : start[0] + diffX * 0.15;
                    defaultY = (StartPos === 'Left' || StartPos === 'Right') ? start[1] + diffY * 0.15 : start[1] + diffY * 0.35;
                } else {
                    defaultX = (EndPos === 'Left' || EndPos === 'Right') ? start[0] + diffX * 0.75 : end[0] - diffX * 0.15;
                    defaultY = (EndPos === 'Left' || EndPos === 'Right') ? end[1] - diffY * 0.15 : start[1] + diffY * 0.75;
                }

                return [
                    item.x != null ? item.x : defaultX,
                    item.y != null ? item.y : defaultY
                ];
            });
        }
        ////var cpArr = [];

        if (arrowPosition === 'start' || arrowPosition === 'both') {
            switch (EndPos) {
                case 'Left':
                    end[0] -= 5;
                    break;
                case 'Right':
                    end[0] += 5;
                    break;
                case 'Top':
                    end[1] -= 5;
                    break;
                case 'Bottom':
                    end[1] += 5;
                    break;
            }
        }
        if (arrowPosition === 'end' || arrowPosition === 'both') {
            switch (StartPos) {
                case 'Left':
                    start[0] -= 5;
                    break;
                case 'Right':
                    start[0] += 5;
                    break;
                case 'Top':
                    start[1] -= 5;
                    break;
                case 'Bottom':
                    start[1] += 5;
                    break;
            }
        }

        const diffX = end[0] - start[0];
        const diffY = end[1] - start[1];

        if (StartPos && EndPos) {
            // start
            arr.push(start);

            // addoditional dot start;
            //TODO add || isDragging
            //IF you want to reset the control points while dragging a tool node
            if (cpArr.length == 0) {
                if (StartPos === 'Left' || StartPos === 'Right') {
                    cpArr.push([start[0] + diffX * 0.35, start[1] + diffY * 0.15] );
                } else {
                    cpArr.push([start[0] + diffX * 0.15, start[1] + diffY * 0.35]);
                }
                /* */
                // addotional dot end
                if (EndPos === 'Left' || EndPos === 'Right') {
                    cpArr.push([start[0] + diffX * 0.75, end[1] - diffY * 0.15] );
                } else {
                    cpArr.push([end[0] - diffX * 0.15, start[1] + diffY * 0.75]);
                }
            } 
            // end
            arr.push(end);
        } else {
            arr.push(start);
            cpArr.push([ start[0] + diffX * 0.35, start[1] + diffY * 0.15]);
            arr.push(end);
        }                     
         
        let finalArr = [arr[0], ...cpArr, arr[1]]
        //console.log('dots', finalArr);
        return finalArr;
    }

    public generateDotsWithBez(start, end, bezCtrlX, bezCtrlY, bezCtrlString, currentPathPoints) {
        const arr = [];

        let cpp = currentPathPoints.map(item => {
            // Perform the conversion for each item
            return [
                item.x,
                item.y
            ];
        });     

        //console.log('bezCtrlX', 'bezCtrlY', bezCtrlX, bezCtrlY ); 
        //console.log('bezCtrlString',bezCtrlString);

        arr.push(cpp[0]);
          
    
        if (bezCtrlString === 'control1') {
           
            arr.push([bezCtrlX,bezCtrlY]);
            arr.push([cpp[2][0],cpp[2][1]]);

        } else if (bezCtrlString === 'control2') {
                
            arr.push([cpp[1][0],cpp[1][1]]);
            arr.push([bezCtrlX,bezCtrlY]);
            
        }
    
        arr.push(cpp[3]);
        
        //console.log('and the dots are', arr);
        return arr;
    }
    
    
    

    public culcStartPosition(startLine: HTMLElement, container: HTMLElement, node: BluePrintTool, direction: string): DrawArrow {
        /* */
        const offsetRel = 50;

        const pos = this.getArrowPointerByOffset(startLine, container, direction, offsetRel);

        this.SVG.append('path')
            .attr('id', 'line-' + node.id)
            .attr('class', 'line')
            .attr('d', this.lineGenerator([ [pos.x, pos.y], [pos.x + 20, pos.y + 20] ]))
            .attr('stroke', '#1c57a4')
            .attr('stroke-width', 2)
            .attr('fill', 'transparent')
            .attr('marker-end', 'url(#arrow-marker)');

        const Arrow = {
            start: { nodeId: node.id, x: pos.x, y: pos.y, pos: direction, offset: offsetRel },
            end: { x: pos.x + 20, y: pos.y + 20 },
            controlPoints: [],
            lineId: 'line-' + node.id,
            arrowPosition: 'start',
            relesed: true,
            id: null
        };

        return Arrow;
    }

    /* */

    public getArrowPointerByOffset(el: HTMLElement, container: HTMLElement, position: string, offset: number): { x: number, y: number } {
        const rect = el.getBoundingClientRect();
        const rectContainer = container.getBoundingClientRect();

        const X = rectContainer.x;
        const Y = rectContainer.y;

        const pos = {
            y: rect.y - Y - offsetContainer,
            x: rect.x - X - offsetContainer
        };

        if (position === 'Left' || position === 'Right') {
            pos.x += dotRadius;
            pos.y += rect.height * ( offset / 100 );
        } else {
            pos.x += rect.width * ( offset / 100 );
            pos.y += dotRadius;
        }

        return pos;
    }

    public getArrowPointer(
        el: HTMLElement, container: HTMLElement, postion: string, pointer: { x: number, y: number }
    ): { pointer: { x: number, y: number }, offset: number } {
        const rect = el.getBoundingClientRect();
        const rectContainer = container.getBoundingClientRect();

        const X = rectContainer.x;
        const Y = rectContainer.y;

        const pos = {
            y: rect.y - Y - offsetContainer,
            x: rect.x - X - offsetContainer
        };

        const cursorPointer = {
            x: pointer.x - X - offsetContainer,
            y: pointer.y - Y - offsetContainer,
        };

        const dotPointer = {
            x: pos.x + dotRadius,
            y: pos.y + dotRadius
        };

        let offset = 0;

        if (postion === 'Left' || postion === 'Right') {
            if (cursorPointer.y >= pos.y && cursorPointer.y <= pos.y + rect.height) {
                dotPointer.y = cursorPointer.y;
                offset = Math.floor( (cursorPointer.y - pos.y) / rect.height * 100);
            }
        } else {
            if (cursorPointer.x > pos.x && cursorPointer.x < pos.x + rect.width) {
                dotPointer.x = cursorPointer.x;
                offset = Math.floor( (cursorPointer.x - pos.x) / rect.width * 100);
            }
        }
        return  { pointer: dotPointer, offset };
    }

    public updateExistedArrow(arrow: DrawArrow, container?: HTMLElement, isDragging?: boolean): void {
        //console.log('updateExistedArrow',arrow,arrow.arrowPosition);
        if (container) {
            const refElstart = container.querySelector(`#node-${arrow.start.nodeId} .pointers>.pointer-${arrow.start.pos}`) as HTMLElement;
            if (refElstart) {
                const startPointer = this.getArrowPointerByOffset(refElstart, container, arrow.start.pos, arrow.start.offset);
                arrow.start.x = startPointer.x;
                arrow.start.y = startPointer.y;
            } else {
                console.log(`#node-${arrow.start.nodeId} .pointers>.pointer-${arrow.start.pos}`);
            }

            const refElend = container.querySelector(`#node-${arrow.end.nodeId} .pointers>.pointer-${arrow.end.pos}`) as HTMLElement;
            if (refElend) {
                const endPointer = this.getArrowPointerByOffset(refElend, container, arrow.end.pos, arrow.end.offset);
                arrow.end.x = endPointer.x;
                arrow.end.y = endPointer.y;
            } else {
                console.log(`#node-${arrow.end.nodeId} .pointers>.pointer-${arrow.end.pos}`);
            }
        }

        //TODO
        //NOTE
        //Comment out this line if you want the control points to NOT change while dragging a tool node
        //if (isDragging) arrow.controlPoints = [];

        const dots = this.genrateDots([arrow.start.x, arrow.start.y], [arrow.end.x, arrow.end.y], arrow.start.pos, arrow.end.pos, arrow.controlPoints, isDragging, arrow.arrowPosition);
        //this.SVG.select(`path#${arrow.lineId}`).attr('d', this.lineGenerator(dots));
         
        if (arrow.arrowPosition === 'start') {
            this.SVG.select(`path#${arrow.lineId}`).attr('d', this.lineGenerator(dots)).attr('marker-end', 'url(#arrow-marker)').attr('marker-start', null);
        } else if (arrow.arrowPosition === 'end') {
            this.SVG.select(`path#${arrow.lineId}`).attr('d', this.lineGenerator(dots)).attr('marker-start', 'url(#arrow-marker)').attr('marker-end', null);
        } else if (arrow.arrowPosition === 'both') {
            this.SVG.select(`path#${arrow.lineId}`).attr('d', this.lineGenerator(dots)).attr('marker-start', 'url(#arrow-marker)').attr('marker-end', 'url(#arrow-marker)');
        }
        
    }

    public updateExistedArrowBezier(arrow: DrawArrow, container: HTMLElement, ctrlX: Number, ctrlY: Number, bezCtrl: String, currentPathPoints: any[]): void {
        //console.log(arrow, ctrlX, ctrlY, bezCtrl, currentPathPoints);
        //console.log('currentPathPoints', currentPathPoints);

        //TODO
        //pass control points
        
        const dots = this.generateDotsWithBez([arrow.start.x, arrow.start.y], [arrow.end.x, arrow.end.y], ctrlX, ctrlY, bezCtrl, currentPathPoints);
        this.SVG.select(`path#${arrow.lineId}`)
            .attr('d', this.lineGenerator(dots));
    }

    public getPointsFromPath(pathData) {
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
}
