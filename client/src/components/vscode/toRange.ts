import { Range } from "vscode";
import { RangeObject } from './RangeObject';

export const toRange = (range: RangeObject) => new Range(range.start.line, range.start.character, range.end.line, range.end.character);