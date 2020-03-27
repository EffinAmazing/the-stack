export interface DrawArrow {
    start: { nodeId?: string, x: number, y: number, elRef?: any, pos?: string, offset?: number };
    end: { nodeId?: string, x: number, y: number, elRef?: any, pos?: string, offset?: number };
    lineId: string;
    relesed?: boolean;
}