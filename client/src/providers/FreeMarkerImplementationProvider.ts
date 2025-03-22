import { CancellationToken, ImplementationProvider, LocationLink, Position, Range, TextDocument, Uri, workspace } from 'vscode';
import { SymbolInfo } from '../components/managers/SymbolManager';
import { Metrics } from '../components/telemetry/Metrics';
import { Telemetry } from '../components/telemetry/Telemetry';
import { toRange } from '../components/vscode/toRange';
import { registerHandlers } from '../lib/vscode/Watcher';
import path = require('path');

type DocumentCacheKey = string;
interface DefinitionCacheEntry {
  definition: LocationLink;
};
export interface DocumentCacheEntry {
  hash: string;
  definitionCache: DefinitionCacheEntry[];
}

export interface Match {
  name: string;
  start: number;
  end: number;
}

type UriStr = string;
export class FreeMarkerImplementationProvider implements ImplementationProvider {
  private documentCache: Record<DocumentCacheKey, DocumentCacheEntry> = {};
  private disposables: Array<{ dispose: () => void }> = [];
  private symbols: Record<UriStr, SymbolInfo[]> = {};

  constructor() {
    const idPrefix = "FreeMarkerImplementationProvider";
    this.disposables.push(registerHandlers(
      { name: idPrefix, type: 'onDidCreate', event: this.handleCreatedFile },
      { name: idPrefix, type: 'onDidDelete', event: this.handleDeletedFile },
      { name: idPrefix, type: 'onDidChange', event: this.handleChangedFile },
    ));
    this.findFiles().then(uris => {
      for (const uri of uris) {
        this.setDefinitions(uri);
      }
    });
  }

  async findFiles(): Promise<Uri[]> {
    const uris: Uri[] = [];
    const fp = path.join(
      '**',
      '*.ftl',
    );
    uris.push(...await workspace.findFiles(fp));
    return uris;
  }

  private handleCreatedFile = async (uri: Uri) => {
    this.setDefinitions(uri);
  }

  private handleChangedFile = async (uri: Uri) => {
    try {
      this.setDefinitions(uri);
    } catch (e) {
      console.error(e);
    }
  }

  private getSymbols() {
    /** return flat map of symbols */
    return Object.values(this.symbols).flat();
  }

  private handleDeletedFile = async (uri: Uri) => {
    delete this.symbols[uri.toString()];
  }

  private setDefinitions = async (uri: Uri) => {
    const doc = await workspace.openTextDocument(uri);
    const symbols: SymbolInfo[] = [];

    /** find all matches for `<@macro_name` */
    // const macroRegex = /<@([a-zA-Z0-9_]+)\s*/g;
    const macroRegex = /<#macro\s+([a-zA-Z0-9_]+)\s*/g;
    let match: RegExpExecArray | null;
    const definitions: Match[] = [];
    while ((match = macroRegex.exec(doc.getText())) !== null) {
      const name = match[1];
      const start = match.index;
      const end = start + match[0].length;
      definitions.push({ name, start, end });
    }

    for (const definition of definitions) {
      /** Push the LocationLink into locations */
      const targetRange = new Range(doc.positionAt(definition.start + `<#macro `.length), doc.positionAt(definition.end - 1));
      symbols.push({
        value: definition.name,
        location: {
          uri: uri.toString(),
          rangeObject: targetRange,
        },
      });
    }

    this.symbols[uri.toString()] = symbols || [];
  }

  private getDocumentCacheKey = (document: TextDocument): string => {
    return `${document.uri.toString()}`;
  }

  async provideImplementation(document: TextDocument, position: Position, token: CancellationToken) {
    Telemetry.publish([{
      MetricName: Metrics.GoToImplementation,
      Unit: 'Count',
      Value: 1,
    }]);
    const definition = await this.buildDefinition(document, position);
    return definition;
  }

  private buildDefinition = async (document: TextDocument, position: Position): Promise<LocationLink[] | null> => {
    const text = document.getText();
    /** Finds all definitions of macro `<#macro macro_name ` */
    // const macroRegex = /<#macro\s+([a-zA-Z0-9_]+)\s*/g;
    const macroRegex = /<@([a-zA-Z0-9_]+)\s*/g;
    let match: RegExpExecArray | null;
    let usage: Match | null = null;
    while ((match = macroRegex.exec(text)) !== null) {
      const name = match[1];
      const start = match.index;
      const end = start + match[0].length;
      const range = new Range(document.positionAt(start), document.positionAt(end));
      if (range.contains(position)) {
        usage = { name, start, end };
      }
    }
    if (!usage) {
      return [];
    }
    const locations: LocationLink[] = [];
    const symbolInfos = this.getSymbols();
    for (const symbolInfo of symbolInfos) {
      if (symbolInfo.value === usage.name) {
        const originSelectionRange = new Range(document.positionAt(usage.start), document.positionAt(usage.end));
        const location: LocationLink = {
          originSelectionRange,
          targetUri: Uri.parse(symbolInfo.location.uri),
          targetRange: toRange(symbolInfo.location.rangeObject),
        };
        locations.push(location);
      }
    };
    return locations;
  }

  dispose() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }
}
