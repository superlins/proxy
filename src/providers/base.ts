export interface Provider {
    /** Source display name */
    readonly name: string;
    /** Fetch raw subscription content */
    fetch(): Promise<string>;
}
