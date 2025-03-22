import { ViewColumn, window } from "vscode";

export const getBesideViewColumn = () => {
  const editor = window.activeTextEditor;
  if (!editor) {
    throw new Error('No active editor');
  }
  const currentColumn = editor.viewColumn;
  const viewColumns = window.visibleTextEditors.length;
  const targetColumn = currentColumn === 1 ? 2 : 1;
  return viewColumns > 1 ? targetColumn
    : ViewColumn.Beside;
}