import { Mutator } from '../visitors/Mutator';
import { Parser } from "./Parser";
import { CloseToken, CommentCloseToken, CommentOpenToken, DirectiveOpenCloseToken, DirectiveOpenOpenToken, Token, UserDefinedDirectiveOpenOpenToken } from "./Token";
import {
  closeClose,
  closeOpen,
  commentClose,
  commentOpen,
  directiveOpenClose,
  directiveOpenOpen,
  expressionClose,
  expressionOpen,
  isBodyRequired,
  string,
  userDefinedDirectiveOpenClose,
  userDefinedDirectiveOpenOpen
} from './grammar';
import { AnyDirectiveElement, BuiltInDirective, Directive, DirectiveElement, Element, ExpressionElement, RootElement, SelfClosingCommentElement, UserDefinedDirectiveElement } from './node/Element';

export class FreeMarkerOptimisticParser extends Parser {

  public rejected: Token[] = [];
  private cache: Record<number, {
    position: number,
    element: Element,
  }> = {};

  constructor(
    tokens: Token[],
    private mutators: Mutator[] = [],
  ) {
    super(tokens);
  }

  public parse(): RootElement {
    const tree: RootElement | AnyDirectiveElement = { type: "root", elements: [] };
    while (this.hasMore()) {
      this.appendChildrenTo(tree);
    }
    return tree;
  }

  private appendChildrenTo(parent: RootElement | AnyDirectiveElement) {
    const element = this.parseElement();
    if (element) {
      if (parent.elements) {
        parent.elements.push(element);
      } else {
        parent.elements = [element];
      }
    }
  }

  private parseElement(reject = true): Element {
    const position = this.position();
    const cached = this.cache[this.position()];
    if (cached !== undefined) {
      this.setPosition(cached.position);
      return cached.element;
    }
    let element: Element | null = null;
    if (this.match(string)) {
      const token = this.consume();
      element = {
        type: "string",
        value: token,
      } as Element;
    } else 

    if (this.match(directiveOpenOpen)) {
      element = this.parseDirective() as Element;
    } else

    if (this.match(userDefinedDirectiveOpenOpen)) {
      element = this.parseUserDefinedDirective() as Element;
    } else

    if (this.match(commentOpen)) {
      element = this.parseComment() as Element;
    } else

    if (this.match(expressionOpen)) {
      element = this.parseExpression() as Element;
    } 

    if (element) {
      this.cache[position] = {
        position: this.position(),
        element,
      };
      return element;
    }
    const token = this.consume();
    if (reject) {
      this.rejected.push(token);
    }
  }

  private lookAhead(match: string): boolean {
    const prevPosition = this.position();
    while (this.hasMore() && !this.match(match)) {
      this.parseElement(false);
    }
    const isMatch = this.peek()?.value === match;
    this.setPosition(prevPosition);
    return isMatch;
  }

  private parseDirective(): DirectiveElement {
    const element: Partial<DirectiveElement> = {};
    if (this.match(
      directiveOpenOpen
    )) {
      element.type = "directive";
      element.open = this.consume() as DirectiveOpenOpenToken;
      element.tag = this.consume();
      element.directive = element.tag.value as BuiltInDirective;
      const properties: Element[] = [];
      while (this.hasMore() && !(this.match(closeOpen) || this.match(closeClose))) {
        properties.push({
          type: 'string',
          value: this.consume() as Token,
        });
      }
      const isCloseOpen = this.match(closeOpen);
      const isCloseClose = this.match(closeClose);
      const _closeOpen = this.consume() as CloseToken;
      const isTagMatch = this.lookAhead(element.tag.value);
      if ((isCloseOpen || isCloseClose) && !isTagMatch && !isBodyRequired(element.tag.value)) {
        element.selfClosing = true;
        element.close = _closeOpen;
        element.elements = properties;
        return element as DirectiveElement;
      }
      const elements: Element[] = [];
      while (this.hasMore() && !this.match(directiveOpenClose)) {
        elements.push(this.parseElement());
      }
      const _openClose = this.consume() as DirectiveOpenCloseToken;
      const closeTag = this.consume();
      element.close = this.consume() as CloseToken;
      element.elements = [
        { 
          type: "open",
          open: element.open,
          tag: element.tag,
          close: _closeOpen,
          elements: properties,
        },
        ...elements,
        { 
          type: "close",
          open: _openClose,
          tag: closeTag,
          close: element.close,
        },
      ];
    }
    return element as DirectiveElement;
  }

  private parseUserDefinedDirective(): UserDefinedDirectiveElement {
    const element: Partial<UserDefinedDirectiveElement> = {};
    if (this.match(
      userDefinedDirectiveOpenOpen
    )) {
      element.type = "userdefined";
      element.open = this.consume() as UserDefinedDirectiveOpenOpenToken;
      element.tag = this.consume();
      element.directive = element.tag.value as Directive;
      const properties: Element[] = [];
      while (this.hasMore() && !(this.match(closeOpen) || this.match(closeClose))) {
        properties.push({
          type: 'string',
          value: this.consume() as Token,
        });
      }
      const isCloseOpen = this.match(closeOpen);
      const isCloseClose = this.match(closeClose);
      const _closeOpen = this.consume() as CloseToken;
      const isTagMatch = this.lookAhead(userDefinedDirectiveOpenClose);
      if (isCloseClose || (isCloseOpen && !isTagMatch)) {
        element.selfClosing = true;
        element.close = _closeOpen;
        element.elements = properties;
        return element as UserDefinedDirectiveElement;
      }
      const elements: Element[] = [];
      while (this.hasMore() && !this.match(userDefinedDirectiveOpenClose)) {
        elements.push(this.parseElement());
      }
      const _openClose = this.consume() as DirectiveOpenCloseToken;
      const closeTag = this.consume();
      element.close = this.consume() as CloseToken;
      element.elements = [
        { 
          type: "open",
          open: element.open,
          tag: element.tag,
          close: _closeOpen,
          elements: properties,
        },
        ...elements,
        { 
          type: "close",
          open: _openClose,
          tag: closeTag,
          close: element.close,
        },
      ];
    }
    return element as UserDefinedDirectiveElement;
  }

  private parseComment(): SelfClosingCommentElement {
    const element: Partial<SelfClosingCommentElement> = {};
    if (this.match(
      commentOpen
    )) {
      element.type = "comment";
      element.open = this.consume() as CommentOpenToken;
      element.selfClosing = true;
      while (this.hasMore() && !this.match(commentClose)) {
        element.elements = [{
          type: 'string',
          value: this.consume() as Token,
        }];
      }
      element.close = this.consume() as CommentCloseToken;
    }
    return element as SelfClosingCommentElement;
  }
  
  private parseExpression(): ExpressionElement {
    const element: Partial<ExpressionElement> = {};
    if (this.match(
      expressionOpen,
    )) {
      element.type = "expression";
      element.open = this.consume();
      const elements: Element[] = [];
      while (this.hasMore() && !this.match(expressionClose)) {
        elements.push({
          type: 'string',
          value: this.consume() as Token,
        });
      }
      element.elements = elements;
      element.close = this.consume();
    }
    return element as ExpressionElement;
  }

}