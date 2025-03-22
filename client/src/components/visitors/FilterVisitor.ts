import { FilterManager } from '../managers/FilterManager';
import { Element } from '../parser/node/Element';
import { Visitor, breadthFirst } from './Visitor';

export class FilterVisitor implements Visitor {
  traversalMode = breadthFirst;

  constructor(
    private filterManager: FilterManager,
  ) {
  }

  visit(node: Element) {
    this.filterManager.filter(node);
  }
}