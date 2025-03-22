import { PositionObject } from './PositionObject';

export interface RangeObject {
  start: PositionObject;
  end: PositionObject;
}

export const compareRange = (a: RangeObject, b: RangeObject) => {
  const { start: aStart, end: aEnd } = a;
  const { start: bStart, end: bEnd } = b;
  if (aStart.line < bStart.line) {
    return -1;
  } else if (aStart.line > bStart.line) {
    return 1;
  } else if (aStart.line === bStart.line) {
    if (aStart.character < bStart.character) {
      return -1;
    } else if (aStart.character > bStart.character) {
      return 1;
    }
  }
  return 0;
};
