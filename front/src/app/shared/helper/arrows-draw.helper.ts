


import * as d3 from 'd3';
import { DrawArrow } from '../models/draws-item';
import { BluePrintTool } from '../../shared/models/tool';
import { Container } from '@angular/compiler/src/i18n/i18n_ast';
// const lineGenerator = d3.line().curve(d3.curveCardinal);
const dotRadius = 5;
const offsetContainer = 20;

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

    public genrateDots(start, end, StartPos?, EndPos?) {
        const arr = [];
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
        const diffX = end[0] - start[0];
        const diffY = end[1] - start[1];

        if (StartPos && EndPos) {
            // start
            arr.push(start);

            // addoditional dot start;
            if (StartPos === 'Left' || StartPos === 'Right') {
                arr.push([start[0] + diffX * 0.35, start[1] + diffY * 0.15] );
            } else {
                arr.push([start[0] + diffX * 0.15, start[1] + diffY * 0.35]);
            }
            /* */
            // addotional dot end
            if (EndPos === 'Left' || EndPos === 'Right') {
                arr.push([start[0] + diffX * 0.75, end[1] - diffY * 0.15] );
            } else {
                arr.push([end[0] - diffX * 0.15, start[1] + diffY * 0.75]);
            }
            // end
            arr.push(end);
        } else {
            arr.push(start);
            arr.push([ start[0] + diffX * 0.35, start[1] + diffY * 0.15]);
            arr.push(end);
        }
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
            lineId: 'line-' + node.id,
            relesed: true
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

    public updateExistedArrow(arrow: DrawArrow, container?: HTMLElement): void {
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
        const dots = this.genrateDots([arrow.start.x, arrow.start.y], [arrow.end.x, arrow.end.y], arrow.start.pos, arrow.end.pos );
        this.SVG.select(`path#${arrow.lineId}`)
            .attr('d', this.lineGenerator(dots));
    }
}
