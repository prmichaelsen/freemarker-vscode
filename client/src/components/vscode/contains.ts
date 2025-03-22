import { PositionObject } from './PositionObject';
import { RangeObject } from './RangeObject';

export const contains = (rangeObject: RangeObject, positionObject: PositionObject) => {
  const { start, end, } = rangeObject;
  return positionObject.line >= start.line 
    && positionObject.character >= start.character
    && positionObject.line <= end.line
    && positionObject.character <= end.character
};