import { RangeObject } from '../vscode/RangeObject';
import { DocumentManagerText } from './DocumentManagerText';

export interface SymbolInfo {
  value: string;
  location: {
    uri: string;
    rangeObject: RangeObject;
  };
}

export class SymbolManager {
  private symbols: SymbolInfo[] = [];

  constructor(
    private documentManager: DocumentManagerText,
  ) {}

  public registerSymbol(symbolInfo: SymbolInfo) {
    this.symbols.push(symbolInfo);
  }

  public getSymbols() {
    return this.symbols;
  }
}