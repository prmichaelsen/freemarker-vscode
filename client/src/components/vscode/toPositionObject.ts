import { Position } from "vscode";
import { PositionObject } from './PositionObject';

export const toPositionObject = (position: Position): PositionObject => {
  const { line, character } = position;
  return {
    line,
    character
  };
};