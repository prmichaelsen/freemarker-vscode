import { FileSystemWatcher, workspace, Event, Uri, ExtensionContext } from 'vscode';
import * as path from 'node:path';
import { isFreeMarkerWorkspaceFolder } from './isFreeMarkerWorkspaceFolder';

interface Disposable { dispose(): void };
export type EventType = 'onDidCreate' | 'onDidChange' | 'onDidDelete';
export type FileEvent = (e: Uri) => any;
export interface Listener {
  name: string;
  type: EventType;
  event: FileEvent;
}
export class Watcher {
  private disposables: Disposable[] = [];
  private fsWatchers: FileSystemWatcher[] = [];
  private listeners: Record<string, Listener> = {};

  constructor() {
    this.registerWatchers();
    this.registerHandlersWithWatchers();
  }

  public registerWatchers() {
    const folders = workspace.workspaceFolders || [];
    for (const folder of folders) {
      if (!isFreeMarkerWorkspaceFolder(folder)) {
        continue;
      }
      const watchPath = path.join(
        folder.uri.fsPath,
        `**`,
        `*.ftl`,
      );
      const fsWatcher = workspace.createFileSystemWatcher(watchPath);
      this.fsWatchers.push(fsWatcher);
      this.disposables.push(fsWatcher);
    }
  }

  private registerHandlersWithWatchers(): void {
    for (const fsWatcher of this.fsWatchers) {
      this.disposables.push(fsWatcher.onDidCreate(uri => {
        const listeners = Object.values(this.listeners);
        const handlers = listeners.filter(l => l.type === 'onDidCreate');
        for (const handler of handlers) {
          handler.event(uri);
        }
      }));
      this.disposables.push(fsWatcher.onDidDelete(uri => {
        const listeners = Object.values(this.listeners);
        const handlers = listeners.filter(l => l.type === 'onDidDelete');
        for (const handler of handlers) {
          handler.event(uri);
        }
      }));
      this.disposables.push(fsWatcher.onDidChange(uri => {
        const listeners = Object.values(this.listeners);
        const handlers = listeners.filter(l => l.type === 'onDidChange');
        for (const handler of handlers) {
          handler.event(uri);
        }
      }));
    }
  }

  public registerHandlers(...listeners: Listener[]): Disposable {
    for (const listener of listeners) {
      const { name, type } = listener;
      this.listeners[name + '#' + type] = listener;
    }
    return this;
  }

  public dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables = [];
  }
}

let watcher: Watcher;
export const registerWatcher = (context: ExtensionContext) => {
  watcher = new Watcher();
  context.subscriptions.push(watcher);
}
export const registerHandlers = (...handlers: Listener[]): Disposable => {
  if (watcher) {
    watcher.registerHandlers(...handlers);
    return watcher;
  }
  return { dispose: () => { } };
}