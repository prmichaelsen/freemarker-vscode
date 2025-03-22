import { RangeObject } from '../vscode/RangeObject';
import { closeClose, closeOpen, commentClose, commentOpen, directiveOpenClose, directiveOpenOpen, userDefinedDirectiveOpenClose, userDefinedDirectiveOpenOpen } from './grammar';

export interface BaseToken {
	index?: number;
	range?: RangeObject;
}

export interface DirectiveOpenOpenToken extends BaseToken {
  type: typeof directiveOpenOpen,
  value: typeof directiveOpenOpen,
}

export interface DirectiveOpenCloseToken extends BaseToken {
  type: typeof directiveOpenClose,
  value: typeof directiveOpenClose,
}

export interface UserDefinedDirectiveOpenOpenToken extends BaseToken {
  type: typeof userDefinedDirectiveOpenOpen,
  value: typeof userDefinedDirectiveOpenOpen,
}

export interface UserDefinedDirectiveOpenCloseToken extends BaseToken {
  type: typeof userDefinedDirectiveOpenClose,
  value: typeof userDefinedDirectiveOpenClose,
}

export interface CloseOpenToken extends BaseToken {
  type: typeof closeOpen,
  value: typeof closeOpen,
}

export interface CloseToken extends BaseToken {
  type: typeof closeClose,
  value: typeof closeClose,
}

export interface CommentOpenToken extends BaseToken {
  type: typeof commentOpen,
  value: typeof commentOpen,
}

export interface CommentCloseToken extends BaseToken {
  type: typeof commentClose,
  value: typeof commentClose,
}

export interface AnyToken extends BaseToken {
  type: string,
  value: string,
}

const closeCloseToken: CloseToken = {
  type: closeClose,
  value: closeClose,
};

export type Token =
  | DirectiveOpenOpenToken
  | DirectiveOpenCloseToken
  | UserDefinedDirectiveOpenOpenToken
  | UserDefinedDirectiveOpenCloseToken
  | CloseOpenToken
  | CloseToken
  | AnyToken
  ;