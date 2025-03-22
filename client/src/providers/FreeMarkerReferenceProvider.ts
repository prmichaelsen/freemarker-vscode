import * as path from 'node:path';
import { CancellationToken, Location, Position, Range, ReferenceContext, ReferenceProvider, TextDocument, Uri, workspace } from 'vscode';
import { SymbolInfo } from '../components/managers/SymbolManager';
import { toRange } from '../components/vscode/toRange';
import { registerHandlers } from '../lib/vscode/Watcher';

export interface Match {
  name: string;
  start: number;
  end: number;
}

type UriStr = string;
export class FreeMarkerReferenceProvider implements ReferenceProvider {

  private disposables: Array<{ dispose: () => void }> = [];
  private symbols: Record<UriStr, SymbolInfo[]> = {};

  constructor() {
    const idPrefix = "FreeMarkerReferenceProvider";
    this.disposables.push(registerHandlers(
      { name: idPrefix, type: 'onDidCreate', event: this.handleCreatedFile },
      { name: idPrefix, type: 'onDidDelete', event: this.handleDeletedFile },
      { name: idPrefix, type: 'onDidChange', event: this.handleChangedFile },
    ));
    this.findFiles().then(uris => {
      for (const uri of uris) {
        this.setReferenceInfos(uri);
      }
    });
  }

  async findFiles(): Promise<Uri[]> {
    const uris: Uri[] = [];
    const fp = path.join(
      'webapp',
      '**',
      '*.ftl',
    );
    uris.push(...await workspace.findFiles(fp));
    return uris;
  }

  private getSymbols() {
    /** return flat map of symbols */
    return Object.values(this.symbols).flat();
  }

  provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): Location[] {
    const text = document.getText();
    /** Finds all definitions of macro `<#macro macro_name ` */
    // const macroRegex = /<#macro\s+([a-zA-Z0-9_]+)\s*/g;
    const macroRegex = /<#macro\s+([a-zA-Z0-9_]+)\s*/g;
    let match: RegExpExecArray | null;
    let definition: Match | null = null;
    while ((match = macroRegex.exec(text)) !== null) {
      const name = match[1];
      const start = match.index;
      const end = start + match[0].length;
      const range = new Range(document.positionAt(start), document.positionAt(end));
      if (range.contains(position)) {
        definition = { name, start, end };
      }
    }
    if (!definition) {
      return [];
    }
    const locations: Location[] = [];
    const symbolInfos = this.getSymbols();
    for (const symbolInfo of symbolInfos) {
      if (symbolInfo.value === definition.name) {
        const location: Location = {
          uri: Uri.parse(symbolInfo.location.uri),
          range: toRange(symbolInfo.location.rangeObject),
        };
        locations.push(location);
      }
    };
    return locations;
  }

  private getLocations(value: string): Location[] {
    const refs: SymbolInfo[] = [];
    for (const key in this.symbols) {
      refs.push(...this.symbols[key]);
    }
    return refs
      .filter(r => r.value === value)
      .map(({ location }) => ({
        range: toRange(location.rangeObject),
        uri: Uri.parse(location.uri),
      }));
  }

  private handleCreatedFile = async (uri: Uri) => {
    this.setReferenceInfos(uri);
  }

  private handleChangedFile = async (uri: Uri) => {
    try {
      this.setReferenceInfos(uri);
    } catch (e) {
      console.error(e);
    }
  }

  private handleDeletedFile = async (uri: Uri) => {
    delete this.symbols[uri.toString()];
  }

  private setReferenceInfos = async (uri: Uri) => {
    const doc = await workspace.openTextDocument(uri);
    const symbols: SymbolInfo[] = [];

    /** find all matches for `<@macro_name` */
    // const macroRegex = /<@([a-zA-Z0-9_]+)\s*/g;
    const macroRegex = /<@([a-zA-Z0-9_]+)\s*/g;
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
      const targetRange = new Range(doc.positionAt(definition.start + `<@`.length), doc.positionAt(definition.end - 1));
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

  dispose() {
  }
}