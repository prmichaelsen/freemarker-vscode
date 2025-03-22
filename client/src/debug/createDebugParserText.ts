import { _testUtil_toVarName } from '../components/parser/grammar';
import { Element } from '../components/parser/node/Element';
import { Token } from '../components/parser/Token';

const tokenToString = (token: Token) => {
  const { type, value, index } = token;
  const parts: string[] = [];
  if (type) {
    parts.push(`type: ${_testUtil_toVarName(type)}`);
  }
  if (value) {
    parts.push(`value: ${_testUtil_toVarName(value)}`);
  }
  if (index !== undefined) {
    parts.push(`index: ${index}`);
  }
  return `{ ${parts.join(', ')} }`;
}

const visit = (element: Element): string => {
  return JSON.stringify(element, null, 2);
}

export const createDebugParserText = (positional: Element) => {
  const contents =  visit(positional);
  return contents;
}