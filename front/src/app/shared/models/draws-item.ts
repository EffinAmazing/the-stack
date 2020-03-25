export interface DrawArrow {
    start: { nodeId?: string, x: number, y: number, elRef?: any, pos?: string };
    end: { nodeId?: string, x: number, y: number, elRef?: any, pos?: string };
    lineId: string;
    relesed?: boolean;
}