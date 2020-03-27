export interface HistoryAction {
    name: string;
    data: { [key: string]: any };
    subactions?: Array<{
        name: string;
        data: { [key: string]: any }
    }>;
}
