import { TextDocument } from 'vscode';
import { DocumentManagerBase } from './DocumentManagerBase';
import { Token } from '../parser/Token';
import { RangeObject } from '../vscode/RangeObject';
import { PositionObject } from '../vscode/PositionObject';

export class DocumentManager implements DocumentManagerBase {
  constructor(private textDocument: TextDocument) {
  }

  public getRangeFromLine(line: number): RangeObject {
    const range = this.textDocument.lineAt(line).range;
    return {
      start: range.start,
      end: range.end,
    }
  }

  public getRange(start: number, end: number): RangeObject {
    return {
      start: this.textDocument.positionAt(start),
      end: this.textDocument.positionAt(end),
    };
  }

  public getTokenRange(token: Token): RangeObject {
    const { value, index } = token;
    return this.getRange(index!, index! + value.length);
  }

  public getUri(): string {
    return this.textDocument.uri.toString();
  }

  public getPosition(index: number): PositionObject {
    const range = this.textDocument.positionAt(index);
    return { 
      line: range.line,
      character: range.character
    };
  }

  public getDelimitedRange(start: Token, end: Token): RangeObject {
    return this.getRange(start.index!, end.index! + end.value.length);
  }
}