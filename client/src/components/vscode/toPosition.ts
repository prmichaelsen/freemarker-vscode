import { Position } from "vscode";
import { PositionObject } from './PositionObject';

export const toPosition = (position: PositionObject): Position => {
    return new Position(position.line, position.character);
};