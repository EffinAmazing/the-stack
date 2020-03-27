


import * as d3 from 'd3';
// const lineGenerator = d3.line().curve(d3.curveCardinal);
const dotRadius = 9;

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
        const diffX = end[0] - start[0];
        const diffY = end[1] - start[1];

        if (StartPos && EndPos) {
            // start
            const startX = start[0] + dotRadius; const startY = start[1] + dotRadius;
            let endX = end[0] + dotRadius; let endY = end[1] + dotRadius;

            arr.push([startX, startY]);

            if (StartPos.indexOf('Top') !== -1 || StartPos.indexOf('Bottom') !== -1) {
            arr.push([ startX + diffX * 0.15, start[1] + diffY * 0.35 ]);
            }

            if (StartPos === 'Left' || StartPos === 'Right') {
            arr.push([ start[0] + diffX * 0.35  + dotRadius, start[1] + diffY * 0.15 + dotRadius] );
            }

            if (EndPos === 'Left' || EndPos === 'Right') {
            arr.push([ start[0] + diffX * 0.65 + dotRadius * 0.5, start[1] + diffY * 0.85 + dotRadius * 0.5]);
            }

            if (EndPos === 'Left') {
            endX = end[0] + dotRadius * 0.5;
            } else if (EndPos === 'Right' ) {
            endX = end[0] + dotRadius * 1.5;
            } else {
            endX = end[0] + dotRadius;
            }

            if (EndPos.indexOf('Top') !== -1 || EndPos.indexOf('Bottom') !== -1) {
            arr.push([ startX + diffX * 0.85, start[1] + diffY * 0.65]);
            }

            if (EndPos.indexOf('Top') !== -1) {
            // arr.push([ end[0] + diffX * 0.95, end[1] + diffY * 0.75]);
            endY = end[1] + dotRadius * 0.5;
            } else if (EndPos.indexOf('Bottom') !== -1) {
            endY = end[1] + dotRadius * 1.5;
            } else {
            endY = end[1] + dotRadius;
            }

            arr.push([endX, endY]);
        } else {
            arr.push(start);
            arr.push([ start[0] + diffX * 0.35, start[1] + diffY * 0.15]);
            arr.push(end);
        }


        return arr;
    }
}
