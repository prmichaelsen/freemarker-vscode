import { CancellationToken, EventEmitter, TextDocumentContentProvider, Uri } from "vscode";
import { debugParserResults } from '../globals/debugParserResults';


export class FreeMarkerDebugParserTextDocumentContentProvider implements TextDocumentContentProvider {

  public static onDidChangeEmitter = new EventEmitter<Uri>();

  onDidChange = FreeMarkerDebugParserTextDocumentContentProvider.onDidChangeEmitter.event;

  provideTextDocumentContent(uri: Uri, token: CancellationToken): string {
    const uriStr = uri.toString();
    const result = debugParserResults[uriStr];
    return result.result;
  }
}