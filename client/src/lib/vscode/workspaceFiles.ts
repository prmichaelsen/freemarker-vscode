import { Uri, workspace } from 'vscode';

let _workspaceFiles: Uri[] | null = null;
workspace.findFiles('**/*.ftl').then(files => {
  _workspaceFiles = files;
});

export const workspaceFiles = async () => {
  if (_workspaceFiles) {
    return _workspaceFiles;
  }
  _workspaceFiles = await workspace.findFiles("**/*.ftl");
  return _workspaceFiles;
}