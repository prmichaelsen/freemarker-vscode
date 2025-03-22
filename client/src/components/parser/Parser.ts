import { Token } from './Token';
import { EOF } from './grammar';
import { BaseElement } from './node/Element';

export class Parser {
  pos: number = 0;

  constructor(public tokens: Token[]) {}

  public parse(): BaseElement {
    throw new Error("Method not implemented.");
  }

  public position() {
    return this.pos;
  }

  public setPosition(pos: number) {
    this.pos = pos;
  }

  consume() {
    this.pos++;
    return this.prev();
  }

  check(type: string): boolean {
    if (!this.hasMore()) {
      return false;
    }
    return this.peek().type === type;
  }

  checkPrevious(type: string): boolean {
    return this.prev().type === type;
  }

  match(...types: string[]) {
    for (const type of types) {
      if (this.check(type)) {
        return true;
      }
    }
    return false;
  }

  matchPrevious(...types: string[]) {
    for (const type of types) {
      if (this.checkPrevious(type)) {
        return true;
      }
    }
    return false;
  }


  peek() {
    return this.tokens[this.pos];
  }

  unexpected() {
    return this.tokens[this.pos] || { type: EOF, value: EOF };
  }

  prev() {
    return this.tokens[this.pos - 1];
  }

  next() {
    return this.tokens[this.pos + 1] || { type: EOF, value: EOF };
  }

  hasMore() {
    return this.pos < this.tokens.length;
  }

  closes(token: Token | undefined) {
    if (!token) {
      return false;
    }
    if (!this.match(
      "/>", ">",
    )) {
      return false;
    }
    switch (token.value) {
      case "<#":
      case "<@":
        return this.check("/>") || this.check(">");
      case "</#":
      case "</@":
        return this.check(">");
    }
  }

}