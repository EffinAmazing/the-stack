export interface DrawArrow {
    start: { nodeId?: string, x: number, y: number, elRef?: any, pos?: string, offset?: number };
    end: { nodeId?: string, x: number, y: number, elRef?: any, pos?: string, offset?: number };
    controlPoints: { x: number, y: number }[];
    arrowPosition: string; //start,end,both
    lineId: string;
    relesed?: boolean;
    id: string;
}