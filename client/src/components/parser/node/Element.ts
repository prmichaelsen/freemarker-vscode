import { CloseToken, CommentCloseToken, CommentOpenToken, DirectiveOpenOpenToken, Token, UserDefinedDirectiveOpenOpenToken } from '../Token';
import { closeClose, commentClose, commentOpen, directiveOpenOpen, string, userdefined, userDefinedDirectiveOpenClose, userDefinedDirectiveOpenOpen, value } from '../grammar';

/** https://freemarker.apache.org/docs/ref_directive_list.html */
const _directives = {
  assign: "assign",
  attempt: "attempt",
  autoesc: "autoesc",
  autoescape: "autoescape",
  break: "break",
  case: "case",
  compress: "compress",
  continue: "continue",
  default: "default",
  else: "else",
  elseif: "elseif",
  escape: "escape",
  fallback: "fallback",
  flush: "flush",
  ftl: "ftl",
  function: "function",
  global: "global",
  if: "if",
  import: "import",
  include: "include",
  items: "items",
  list : "list",
  local: "local",
  lt: "lt",
  macro: "macro",
  nested: "nested",
  noautoesc: "noautoesc",
  noescape: "noescape",
  noparse: "noparse",
  nt: "nt",
  on: "on",
  outputformat: "outputformat",
  parse: "parse",
  recover: "recover",
  recurse: "recurse",
  return: "return",
  rt: "rt",
  sep: "sep",
  setting: "setting",
  stop: "stop",
  switch: "switch",
  t: "t",
  traverse: "traverse",
  visit: "visit",
  when: "when",
}

const directives = {
  ..._directives,
  userdefined: "userdefined",
}

export type BuiltInDirective = keyof typeof _directives;
export type UserDefinedDirective = "userdefined";
export type Directive = keyof typeof directives;

export type DirectiveElementType = "directive";
export type UserDefinedDirectiveElementType = "userdefined";

export interface BaseElement {
}

export interface OpenTagElement extends BaseElement {
  type: "open",
  open: Token,
  tag: Token,
  close: Token,
}

export interface OpenDirectiveTagElement extends BaseElement {
  type: "open",
  open: DirectiveOpenOpenToken,
  tag: Token,
  close: CloseToken,
  elements: Element[],
}

export interface OpenUserDefinedDirectiveTagElement extends BaseElement {
  type: "open",
  open: UserDefinedDirectiveOpenOpenToken,
  tag: Token,
  close: CloseToken,
  elements: Element[],
}

export interface CloseTagElement extends BaseElement {
  type: "close",
  open: Token,
  tag: Token,
  close: Token,
}

export interface SelfClosingDirectiveElement {
  type: "directive",
  selfClosing: true,
  directive: BuiltInDirective,
  /* ie <#(\w+)/> */
  tag: Token,
  /** open, ie (<#)\w+> */
  open: DirectiveOpenOpenToken,
  /** close, ie <#\w+(/>) */
  close: CloseToken,
  /** tag inner content */
  elements: Element[],
}

export interface OpenCloseDirectiveElement extends BaseElement {
  type: "directive",
  directive: BuiltInDirective,
  selfClosing: false,
  /* ie <#(\w+)/> */
  tag: Token,
  /** open, ie (<#)w+> */
  open: DirectiveOpenOpenToken,
  /** close, ie <#w+(>) */
  close: CloseToken,
  elements: [
    /** tag open */
    OpenDirectiveTagElement,
    /** tag inner content */
    ...Element[],
    /** tag close */
    CloseTagElement,
  ],
}

export type DirectiveElement = SelfClosingDirectiveElement | OpenCloseDirectiveElement;

export interface SelfClosingUserDefinedDirectiveElement {
  type: "userdefined",
  directive: string,
  selfClosing: true,
  /* ie <#(\w+)/> */
  tag: Token,
  /** open, ie (<@)\w+> */
  open: UserDefinedDirectiveOpenOpenToken,
  /** close, ie <@\w+(/>) */
  close: CloseToken,
  /** tag inner content */
  elements: Element[],
}

export interface OpenCloseUserDefinedDirectiveElement extends BaseElement {
  type: "userdefined",
  directive: string,
  selfClosing: false,
  /* ie <@(\w+)/> */
  tag: Token,
  /** open, ie (<@)w+> */
  open: UserDefinedDirectiveOpenOpenToken,
  /** close, ie <@w+(>) */
  close: CloseToken,
  elements: [
    /** tag open */
    OpenUserDefinedDirectiveTagElement,
    /** tag inner content */
    ...Element[],
    /** tag close */
    CloseTagElement,
  ],
}

export type UserDefinedDirectiveElement = SelfClosingUserDefinedDirectiveElement | OpenCloseUserDefinedDirectiveElement;

export interface SelfClosingCommentElement {
  type: "comment",
  selfClosing: true,
  /** open, ie (<#--)\w+--> */
  open: CommentOpenToken,
  /** close, ie <#--\w+(-->) */
  close: CommentCloseToken,
  /** tag inner content */
  elements: [Element],
}


export type SelfClosingElement =
  | SelfClosingDirectiveElement
  | SelfClosingUserDefinedDirectiveElement
  ;

export interface OpenCloseElement extends BaseElement {
  // type: Directive,
  // directive: string,
  selfClosing: false,
  /** open, ie (<#)w+> */
  open: Token,
  /** close, ie <#w+(>) */
  close: Token,
  elements: [
    /** tag open */
    OpenTagElement,
    /** tag inner content */
    ...BaseElement[],
    /** tag close */
    CloseTagElement,
  ],
}

export type AnyDirectiveElement = (
    & (SelfClosingElement | OpenCloseElement)
    & (DirectiveElement | UserDefinedDirectiveElement)
);

export interface ExpressionElement {
  type: "expression",
  open: Token,
  close: Token,
  elements: Element[],
}

export type TagElement = 
  | SelfClosingCommentElement
  | AnyDirectiveElement
  ;

export interface StringElement extends BaseElement {
  type: "string",
  value: Token,
}

export interface RootElement extends BaseElement {
  type: "root",
  elements: Element[],
}

export type Element =
  | RootElement
  | ExpressionElement
  | TagElement
  | StringElement
  ;

const _userDefinedSelfClosingDirective: Element = {
  type: "userdefined",
  directive: "MyMacro",
  selfClosing: true,
  open: { type: userDefinedDirectiveOpenOpen, value: userDefinedDirectiveOpenOpen },
  tag: { type: userdefined, value: "MyMacro" },
  close: { type: closeClose, value: closeClose },
  elements: [],
}

const _userDefinedOpenCloseDirective: Element = {
  type: "userdefined",
  directive: "MyMacro",
  tag: { type: userdefined, value: "MyMacro" },
  selfClosing: false,
  open: { type: userDefinedDirectiveOpenOpen, value: userDefinedDirectiveOpenOpen },
  close: { type: closeClose, value: closeClose },
  elements: [
    {
      type: "open",
      open: { type: userDefinedDirectiveOpenOpen, value: userDefinedDirectiveOpenOpen },
      tag: { type: userdefined, value: "MyMacro" },
      elements: [],
      close: { type: closeClose, value: closeClose }
    },
    {
      type: string,
      value: { type: string, value: "<span></span>" },
    },
    {
      type: "close",
      open: { type: userDefinedDirectiveOpenClose, value: userDefinedDirectiveOpenClose },
      tag: { type: userdefined, value: "MyMacro" },
      close: { type: closeClose, value: closeClose },
    },
  ],
}

const _selfClosingUserDefinedDirective: Element = {
  type: "userdefined",
  directive: "MyMacro",
  selfClosing: true,
  open: { type: userDefinedDirectiveOpenOpen, value: userDefinedDirectiveOpenOpen },
  tag: { type: userdefined, value: "MyMacro" },
  close: { type: closeClose, value: closeClose },
  elements: [],
}

const _selfClosingUserDefinedDirectiveWithChildren: Element = {
  type: "userdefined",
  directive: "MyMacro",
  selfClosing: true,
  open: { type: userDefinedDirectiveOpenOpen, value: userDefinedDirectiveOpenOpen },
  tag: { type: userdefined, value: "MyMacro" },
  close: { type: closeClose, value: closeClose },
  elements: [
    {
      type: "string",
      value: { type: value, value: "<span></span>" },
    },
  ],
}

const _selfClosingDirective: Element = {
  type: "directive",
  directive: "if",
  selfClosing: true,
  open: { type: directiveOpenOpen, value: directiveOpenOpen },
  tag: { type: userdefined, value: "MyMacro" },
  close: { type: closeClose, value: closeClose },
  elements: [
    {
      type: "string",
      value: { type: value, value: "<span></span>" },
    },
  ],
}

const _openCloseDirective: Element = {
  type: "directive",
  directive: "if",
  tag: { type: "if", value: "if" },
  selfClosing: false,
  open: { type: directiveOpenOpen, value: directiveOpenOpen },
  close: { type: closeClose, value: closeClose },
  elements: [
    {
      type: "open",
      open: { type: directiveOpenOpen, value: directiveOpenOpen },
      tag: { type: userdefined, value: "MyMacro" },
      elements: [],
      close: { type: closeClose, value: closeClose }
    },
    {
      type: "string",
      value: { type: value, value: "<span></span>" },
    },
    {
      type: string,
      value: { type: string, value: "<span></span>" },
    },
    {
      type: "close",
      open: { type: userDefinedDirectiveOpenClose, value: userDefinedDirectiveOpenClose },
      tag: { type: userdefined, value: "MyMacro" },
      close: { type: closeClose, value: closeClose },
    },
  ],
}


const _selfClosingComment: Element = {
  type: "comment",
  selfClosing: true,
  open: { type: commentOpen, value: commentOpen },
  close: { type: commentClose, value: commentClose },
  elements: [
    {
      type: "string",
      value: { type: value, value: "My comment" },
    },
  ],
}

const _value: Element = {
  type: "string",
  value: { type: value, value: "<span></span>" },
}