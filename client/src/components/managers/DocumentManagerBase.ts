import { Token } from '../parser/Token';
import { PositionObject } from '../vscode/PositionObject';
import { RangeObject } from '../vscode/RangeObject';

export interface DocumentManagerBase {
  getRangeFromLine(line: number): RangeObject;
  getRange(start: number, end: number): RangeObject;
  getTokenRange(token: Token): RangeObject;
  getPosition(index: number): PositionObject;
  getDelimitedRange(start: Token, end: Token): RangeObject;
  getUri(): string;
}