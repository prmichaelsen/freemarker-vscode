import * as vscode from 'vscode';
import { workspace, WorkspaceFolder } from 'vscode';

const cache: {[folder: string]: boolean} = {};

export async function isFreeMarkerWorkspaceFolder(folder: WorkspaceFolder): Promise<boolean> {

  const folderKey = folder.uri.fsPath;
  if (cache[folderKey] !== undefined) {
    return cache[folderKey];
  }

  const files = await workspace.fs.readDirectory(folder.uri);

  for (const file of files) {
    if (file[0].endsWith('.ftl')) {
      cache[folderKey] = true;
      return true;
    }
  }

  cache[folderKey] = false;
  return false;
}