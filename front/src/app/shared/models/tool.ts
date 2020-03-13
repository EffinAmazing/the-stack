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
    position?: { x: number, y: number };
    dependencies?: Array<{
        input: string,
        itemId: string,
        direction: string
    } >
}