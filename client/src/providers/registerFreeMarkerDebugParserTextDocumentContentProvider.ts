import { ExtensionContext, workspace } from "vscode";
import { FreeMarkerDebugParserTextDocumentContentProvider } from "./FreeMarkerDebugParserTextDocumentContentProvider";

export const registerFreeMarkerDebugParserTextDocumentContentProvider = (context: ExtensionContext) => {
  const freeMarkerTextDocumentContentProvider = new FreeMarkerDebugParserTextDocumentContentProvider();
  context.subscriptions.push(
    workspace.registerTextDocumentContentProvider('freemarker-debug', freeMarkerTextDocumentContentProvider)
  );
}