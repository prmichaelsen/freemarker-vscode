import { ExtensionContext, Uri, commands, window, workspace } from 'vscode';
import { FreeMarkerOptimisticParser } from '../components/parser/FreeMarkerOptimisticParser';
import { FreeMarkerTokenizer } from '../components/parser/FreeMarkerTokenizer';
import { FreeMarkerWalker } from '../components/parser/FreeMarkerWalker';
import { createDebugParserText } from '../debug/createDebugParserText';
import { debugParserResults } from '../globals/debugParserResults';
import { getBesideViewColumn } from '../lib/vscode/getBesideViewColumn';
import { FreeMarkerDebugParserTextDocumentContentProvider } from '../providers/FreeMarkerDebugParserTextDocumentContentProvider';

export const registerDebugParserCommand = (context: ExtensionContext) => {
  const dispose = () => null;
  context.subscriptions.push(
    commands.registerCommand('freemarker-vscode.debugParser', async () => {
      const editor = window.activeTextEditor;
      if (!editor) {
        return dispose;
      }

      const workspaceFolder = workspace.getWorkspaceFolder(editor.document.uri);
      if (!workspaceFolder) {
        return dispose;
      }

      const fsPath = editor.document.uri.fsPath;
      const uri = Uri.parse(`freemarker-debug:${fsPath}`);

      const text = editor.document.getText();
      const freeMarkerTokenizer = new FreeMarkerTokenizer(text);
      const tokens = freeMarkerTokenizer.tokenize();
      const optimisticParser = new FreeMarkerOptimisticParser(tokens, [
      ]);
      const program = optimisticParser.parse();
      const walker = new FreeMarkerWalker([
      ])
      walker.walk(program);
      const uriStr = uri.toString();
      debugParserResults[uriStr] = {
        result: createDebugParserText(program),
      }

      FreeMarkerDebugParserTextDocumentContentProvider.onDidChangeEmitter.fire(uri);
      const doc = await workspace.openTextDocument(uri);
      await window.showTextDocument(doc, {
        preview: false,
        preserveFocus: true,
        viewColumn: getBesideViewColumn(),
      });
      return dispose;
    }),
  );
};
