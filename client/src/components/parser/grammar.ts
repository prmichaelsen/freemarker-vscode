// Keywords
// TODO

// Element Types
export const root = "root";
export const directive = "directive";
export const userdefined = "userdefined";
export const open = "open";
export const close = "close";
export const expression = "expression";
export const string = "string";
export const comment = "comment";
export const value = "value";

// Tokens
export const expressionOpen = "${";
export const expressionClose = "}";
export const commentOpen = "<#--";
export const commentClose = "-->";
export const userDefinedDirectiveOpenOpen = "<@";
export const userDefinedDirectiveOpenClose = "</@";
export const directiveOpenOpen = "<#";
export const directiveOpenClose = "</#";
export const htmlOpenOpen = "<";
export const htmlOpenClose = "</";
export const closeOpen = ">";
export const closeClose = "/>";
export const backslash = "\\";
export const invalid = "invalid";
export const minus = "-";
export const dot = ".";
export const lbracket = "[";
export const rbracket = "]";
export const lparen = "(";
export const rparen = ")";
export const dollar = "$";
export const EOF = "EOF";

const map = {
  [root]: root,
  [directive]: directive,
  [userdefined]: userdefined,
  [open]: open,
  [close]: close,
  [expression]: expression,
  [string]: string,
  [comment]: comment,
  [expressionOpen]: expressionOpen,
  [expressionClose]: expressionClose,
  [commentOpen]: commentOpen,
  [commentClose]: commentClose,
  [userDefinedDirectiveOpenOpen]: userDefinedDirectiveOpenOpen,
  [userDefinedDirectiveOpenClose]: userDefinedDirectiveOpenClose,
  [directiveOpenOpen]: directiveOpenOpen,
  [directiveOpenClose]: directiveOpenClose,
  [closeOpen]: closeOpen,
  [closeClose]: closeClose,
  [backslash]: backslash,
  [invalid]: invalid,
  [minus]: minus,
  [dot]: dot,
  [lbracket]: lbracket,
  [rbracket]: rbracket,
  [lparen]: lparen,
  [rparen]: rparen,
  [dollar]: dollar,
  [EOF]: EOF,
  [value]: value,
}

export const _testUtil_toVarName = (key: string) => {
  return map[key] || `\`${key}\``;
}

export const ftlTag = [
  "if",
  "else",
];

export const isSelfClosing = (directive: string) =>
  [
    "assign",
    "import",
    "include",
    "local",
    "else",
    "elseif",
  ].some(d => d === directive);

export const isBodyRequired = (directive: string) =>
  [
    "if",
    "macro",
  ].some(d => d === directive);