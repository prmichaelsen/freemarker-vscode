import { FreeMarkerVisitor } from '../visitors/FreeMarkerVisitor';
import { breadthFirst, depthFirst } from "../visitors/Visitor";
import { Element } from './node/Element';

/**
 * The Walker traverses the Positional tree
 * in one pass, executing each Visitor in order
 * on each Positional in BFS order.
 * 
 * The Walker does not return any values
 * and does not set any values.
 * 
 * Instead, each Visitor is responsible
 * for managing results.
 */
export class FreeMarkerWalker {
  constructor(
    private visitors: Array<FreeMarkerVisitor> = [],
  ) { }

  public walk(element: Element) {
    this.walkDepth(element);
    this.walkBreadth(element);
  }

  private walkDepth(element: Element) {
    const depthVisitors = this.visitors
      .filter(v => v.traversalMode === depthFirst);
    if ("elements" in element) {
      for (const inner of element.elements) {
        this.walkDepth(inner as Element);
      }
    }
    for (const visitor of depthVisitors) {
      visitor.visit(element);
    }
  }

  private walkBreadth(element: Element) {
    const breadthVisitors = this.visitors
      .filter(v => v.traversalMode === breadthFirst);
    for (const visitor of breadthVisitors) {
      visitor.visit(element);
    }
    if ("elements" in element) {
      for (const inner of element.elements) {
        this.walkBreadth(inner as Element);
      }
    }
  }
}