import { Diagnostic, DiagnosticSeverity, Uri, workspace } from 'vscode';
import { getDocumentHash } from '../components/intern/getDocumentHash';
import { DiagnosticManager } from '../components/managers/DiagnosticManager';
import { DocumentManager } from '../components/managers/DocumentManager';
import { FreeMarkerOptimisticParser } from '../components/parser/FreeMarkerOptimisticParser';
import { FreeMarkerTokenizer } from '../components/parser/FreeMarkerTokenizer';
import { FreeMarkerWalker } from '../components/parser/FreeMarkerWalker';
import { DirectiveVisitor } from '../components/visitors/DirectiveVisitor';
import { DiagnosticObjectConverter } from '../components/vscode/toDiagnostic';
import { toRange } from '../components/vscode/toRange';

/**
 * Note: This isn't a real `vscode` provider. 
 * It simply follows the same pattern for consistency's
 * sake.
 * 
 * In reality, the language server connection
 * sends requests for diagnostics to the extension 
 * and then the extension creates the diagnostics.
 * 
 * In a typical setup, the server generates all diagnostics.
 * However, the extension client side owns all of the
 * parsing code, so this workaround was added to avoid
 * duplicating the code on the server side as well.
 * 
 * I could have extracted all of the parser logic
 * into a shared package, but then the default
 * debugger configurations would need some reconfiguration.
 */
type DiagnosticsCacheKey = string;
export interface DiagnosticsCacheEntry {
  hash: string;
  diagnostics: Diagnostic[];
}
export class FreeMarkerDiagnosticsProvider {
  private cache: Record<DiagnosticsCacheKey, DiagnosticsCacheEntry> = {};

  async provideDiagnostics(uri: string): Promise<Diagnostic[]>{
    const cacheKey = uri;
    const doc = await workspace.openTextDocument(Uri.parse(uri));
    if (!doc) {
      return [] as Diagnostic[];
    }
    const hash = getDocumentHash(doc.getText());
    const previousHash = this.cache[cacheKey]?.hash;
    if (hash === previousHash) {
      return this.cache[cacheKey].diagnostics || [];
    }

    const diagnosticManager = new DiagnosticManager();
    const text = doc.getText();
    const freeMarkerTokenizer = new FreeMarkerTokenizer(text);
    const tokens = freeMarkerTokenizer.tokenize();
    const documentManager = new DocumentManager(doc);
    const optimisticParser = new FreeMarkerOptimisticParser(tokens, [
    ]);
    const program = optimisticParser.parse();
    const walker = new FreeMarkerWalker([
      new DirectiveVisitor(documentManager, diagnosticManager ),
    ]);
    const diagnosticConverter = new DiagnosticObjectConverter(documentManager);
    walker.walk(program);
    const diagnostics = [
      ...diagnosticManager.values().map(obj => diagnosticConverter.convert(obj)),
      ...optimisticParser.rejected.map(token => {
        return new Diagnostic(
          toRange(documentManager.getTokenRange(token)),
          `Unexepected token ${token.value}`,
          DiagnosticSeverity.Error,
        )
      }),
    ];
    this.cache[cacheKey] = {
      hash,
      diagnostics,
    };
    return diagnostics;
  }
}