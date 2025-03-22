import { RangeObject } from "../vscode/RangeObject";
import { DocumentManagerBase } from './DocumentManagerBase';
import { Token } from '../parser/Token';

export class DocumentManagerText implements DocumentManagerBase {
  constructor(private text: string, private uri: string) {
  }
  public getRangeFromLine(line: number): RangeObject {
    throw new Error('Method not implemented.');
  }

  public getRange(start: number, end: number): RangeObject {
    return {
      start: this.getPosition(start),
      end: this.getPosition(end)
    }
  }

  public getTokenRange(token: Token): RangeObject {
    const { value, index } = token;
    return this.getRange(index!, index! + value.length);
  }

  public getPosition(index: number) {
    let currIndex = 0;
    let line = 0;
    let character = 0;
  
    for(let i = 0; i < this.text.length; i++) {
      if (this.text[i] === '\n') {
        line++;
        character = 0;
      } else {
        character++;
      }
  
      if (currIndex === index) {
        return { line, character }; 
      }
  
      currIndex++;
    }
  
    return { line, character };
  }

  getDelimitedRange(start: Token, end: Token): RangeObject {
    return this.getRange(start.index!, end.index! + end.value.length);
  }

  public getUri(): string {
    return this.uri;
  }
}