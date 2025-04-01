import { Token } from './Token';
import {
  backslash,
  dot,
  invalid,
  minus,
  string
} from './grammar';


export interface TokenizeOptions {
  index?: boolean;
  ignoreWhitespace?: boolean;
}
export class FreeMarkerTokenizer {
  text: string;
  pos: number = 0;
  quote: string | null = null;
  isInFreeMarker = false;
  isInString = false;
  html = "";
  htmlIndex = 0;

  constructor(text: string) {
    this.text = text;
  }

  openQuote(quote: string) {
    this.quote = quote;
  }

  closeQuote() {
    this.quote = null;
  }

  matchQuote(quote: string) {
    const isQuote = this.text
      .slice(this.pos)
      .indexOf(quote) === 0;
    const isEscaped = this.text
      .slice(this.pos - 1)
      .indexOf(backslash) === 0;
    return isQuote && !isEscaped;
  }

  matchIgnoreWhitespace(type: string) {
    return this.text
      .slice(this.pos)
      .trim()
      .indexOf(type) === 0;
  }

  match(type: string) {
    return this.text
      .slice(this.pos)
      .indexOf(type) === 0;
  }

  matchOneOf(...types: string[]): string | undefined {
    return types.find(type => {
      return this.text
        .slice(this.pos)
        .indexOf(type) === 0;
    });
  }


  tokenize(options: TokenizeOptions = {}): Token[] {
    const { 
      index = true,
      ignoreWhitespace = false,
    } = options;
    const tokens: Token[] = [];

    while (this.pos < this.text.length) {
      tokens.push(...this.readFreeMarker());
    }

    let _tokens = tokens;
    if (!index) {
      _tokens = _tokens.map(token => {
        delete token.index;
        return token;
      });
    }

    if (ignoreWhitespace) {
      _tokens = _tokens.map(token => {
        return {
          ...token,
          value: token.value.trim(),
        };
      });
      // TODO Tests require updating
      // if this is uncommented
      // _tokens = _tokens.filter(token => {
      //   return token.value.length > 0;
      // });
    }
    return _tokens;
  }

  readFreeMarker(): Token[] {
    const tokens: Token[] = [];
    tokens.push(...this.readUntil(
      "<#", "<@", "<#--", "<",
      "</#", "</@", "-->", "</",
    ));
    // if (this.match("${")) {
    //   tokens.push(this.read("${"));
    //   tokens.push(...this.readFirst("}"));
    // }
    // else if (this.match("<#--")){
    if (this.match("<#--")){
      tokens.push(this.read("<#--"));
      tokens.push(...this.readFirst("-->"));
    } 
    else if (this.match("<#")) {
      tokens.push(this.read("<#"));
      tokens.push(...this.readFtlTag());
      tokens.push(...this.readFirst("/>", ">"));
    } 
    else if (this.match("</#")) {
      tokens.push(this.read("</#"));
      tokens.push(...this.readFtlTag());
      tokens.push(...this.readFirst(">"));
    } 
    else if (this.match("<@")) {
      tokens.push(this.read("<@"));
      tokens.push(...this.readFtlTag());
      tokens.push(...this.readFirst("/>", ">"));
    } 
    else if (this.match("</@")) {
      tokens.push(this.read("</@"));
      tokens.push(...this.readFtlTag());
      tokens.push(...this.readFirst(">"));
    } 
    else if (this.match("</")) {
      tokens.push(this.read("</"));
      tokens.push(...this.readHtmlTag());
      tokens.push(...this.readFirst(">"));
    }
    else if (this.match("<")) {
      tokens.push(this.read("<"));
      tokens.push(...this.readHtmlTag());
      tokens.push(...this.readFirst("/>", ">"));
    }
    else {
      tokens.push(...this.readUntilEnd());
    }
    return tokens;
  }

  read(value: string, type?: string): Token {
    // Ignore space
    while (this.pos < this.text.length) {
      const char = this.text[this.pos];
      if (/\s/.test(char)) {
        this.pos++;
      } else {
        break;
      }
    }
    const length = value.length;
    const start = this.pos;
    this.pos += length;
    return { type: type || value, value, index: start };
  }

  readFirst(...matchers: string[]): Token[] {
    const tokens: Token[] = [];
    tokens.push(...this.readUntil(...matchers));
    for (const matcher of matchers) {
      if (this.match(matcher)) {
        tokens.push(this.read(matcher));
        break;
      }
    }
    return tokens;
  }

  readUntilEnd(): Token[] {
    const start = this.pos;
    let value = '';
    while (this.pos < this.text.length) {
      value += this.text[this.pos];
      this.pos++;
    }
    if (value.length > 0) {
      return [{ type: string, value, index: start }];
    } else {
      return [];
    }
  }


  readUntil(...matchers: string[]): Token[] {
    const start = this.pos;
    let value = '';
    while (this.pos < this.text.length) {
      if (this.matchOneOf(...matchers)) {
        break;
      } else {
        value += this.text[this.pos];
        this.pos++;
      }
    }
    if (value.length > 0) {
      return [{ type: string, value, index: start }];
    } else {
      return [];
    }
  }

  readInvalid(): Token {
    const start = this.pos;
    const char = this.text[this.pos++];
    return { type: invalid, value: char, index: start };
  }

  readQuote(quote: string = this.quote!): Token {
    const length = quote.length;
    const start = this.pos;
    this.pos += length;
    return { type: quote, value: quote, index: start };
  }

  readString(): Token {
    const start = this.pos;
    let value = '';
    while (this.pos < this.text.length) {
      if (this.matchQuote(this.quote!)) {
        break;
      } else {
        value += this.text[this.pos];
        this.pos++;
      }
    }
    return { type: string, value, index: start };
  }

  readComment() {
    while (this.pos < this.text.length) {
      const char = this.text[this.pos++];
      if (char === '\n') {
        break;
      }
    }
  }

  readWord(type: string): Token {
    let value = '';
    // Ignore space
    while (this.pos < this.text.length) {
      const char = this.text[this.pos];
      if (/\s/.test(char)) {
        this.pos++;
      } else {
        break;
      }
    }
    let start = this.pos;
    while (this.pos < this.text.length) {
      const char = this.text[this.pos];
      if (/[a-zA-Z_]|[0-9]/.test(char)) {
        value += char;
        this.pos++;
      } else {
        break;
      }
    }
    return { type, value, index: start };
  }

  matchWord(): boolean {
    let value = '';
    let pos = this.pos;
    while (this.pos < this.text.length) {
      const char = this.text[pos];
      if (/[a-zA-Z_]|[0-9]/.test(char)) {
        value += char;
        pos++;
      } else {
        break;
      }
    }
    return value.length > 0;
  }

  readFtlTag(): Token[] {
    let value = '';
    let start = this.pos;
    if (this.text[this.pos] === ".") {
      return [];
    }
    while (this.pos < this.text.length) {
      const char = this.text[this.pos];
      if (/\.|[a-zA-Z_]|[0-9]/.test(char)) {
        value += char;
        this.pos++;
      } else {
        break;
      }
    }
    if (value.length > 0) {
      return [{ type: value, value, index: start }];
    } else {
      return [];
    }
  }

  readHtmlTag(): Token[] {
    let value = '';
    let start = this.pos;
    while (this.pos < this.text.length) {
      const char = this.text[this.pos];
      if (/[a-zA-Z]|[0-9]/.test(char)) {
        value += char;
        this.pos++;
      } else {
        break;
      }
    }
    if (value.length > 0) {
      return [{ type: value, value, index: start }];
    } else {
      return [];
    }
  }

}
