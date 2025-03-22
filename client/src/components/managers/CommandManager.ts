import { commands } from 'vscode';
import { CommandManagerBase } from './CommandManagerBase';

export class CommandManager implements CommandManagerBase {
  async execute(command: string, params: any) {
    return await commands.executeCommand(command, params);
  }

  formatCommandUri(command: string, params: any) {
    return `command:${command}?${encodeURIComponent(JSON.stringify(params))}`;
  }
}