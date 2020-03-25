export interface Tool {
    id?: string;
    categories: string[];
    logo?: string;
    name: string;
    description: string;
    link: string;
    tag: string;
    created?: string;
    updated?: string;
}

export interface BluePrintTool {
    id?: string;
    blueprintId: string;
    toolId: string;
    tool?: Tool;
    hide?: boolean;
    start: string | Date;
    end: string | Date;
    position?: { x: number, y: number };
    dependencies?: Array<{
        input: string,
        itemId: string,
        direction: string
    } >;
}

export interface BluePrint {
    id: string;
    domain: string;
    uniqCode: string;
    spend?: number;
    created?: string;
    updated?: string;
}

export interface BluePrintResp {
    blueprint: BluePrint;
    tools: Tool[];
    nodes: BluePrintTool[];
}