export interface Tool {
    id?: string;
    categories: string[];
    logo?: string;
    name: string;
    description: string;
    link: string;
    tag: string;
    nodeId?: string;
    created?: string;
    updated?: string;
    hidden?: boolean | null; // admin setting: true = Hide, false = Show, null/absent = Default
}

export interface BluePrintTool {
    id?: string;
    blueprintId: string;
    toolId: string;
    tool?: Tool;
    hide?: boolean;
    start?: string | Date;
    end?: string | Date;
    owner?: string;
    cost?: number;
    trainedOn?: string;
    position?: { x: number, y: number };
    dependencies?: Array<{
        input: string,
        itemId: string,
        direction: string
    } >;
    domain: string;
    hiddenGlobally?: boolean;
    rule?: 'show' | 'hide' | null; // admin rule decision, only on nodes the server just created
}

export interface BluePrint {
    id: string;
    domain: string;
    uniqCode: string;
    spend?: number;
    created?: string;
    updated?: string;
    errorCode?: number;
    errorMessage?: string;
}

export interface BluePrintResp {
    blueprint: BluePrint;
    tools: Tool[];
    nodes: BluePrintTool[];
    isNew?: boolean;
    categoryRules?: { whitelisted: string[], blocked: string[] };
}
