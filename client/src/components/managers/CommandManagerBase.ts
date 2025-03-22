export interface CommandManagerBase {
  execute: (command: string, params: any) => Promise<unknown>;
  formatCommandUri: (command: string, params: any) => string;
}