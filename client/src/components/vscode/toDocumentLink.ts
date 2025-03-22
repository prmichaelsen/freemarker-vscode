import { DocumentLink, Range, Uri } from 'vscode';
import { DocumentLinkObject } from './DocumentLinkObject';
import { toRange } from './toRange';

export class KeyDocumentLink extends DocumentLink {
  constructor(
    range: Range, 
    public key: string, 
    target?: Uri
  ) {
    super(range, target);
  }
}

export const toKeyDocumentLink = (documentLinkObject: DocumentLinkObject) => {
  const { range, target, key } = documentLinkObject;
  if (target) {
    return new KeyDocumentLink(toRange(range), key, Uri.parse(target));
  } else {
    return new KeyDocumentLink(toRange(range), key);
  }
}