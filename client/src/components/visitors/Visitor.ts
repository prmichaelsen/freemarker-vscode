import { Element } from '../parser/node/Element';

export type TraversalMode = 'breadthFirst' | 'depthFirst';
export const breadthFirst: TraversalMode = 'breadthFirst';
export const depthFirst: TraversalMode = 'depthFirst';
/** Visitors visit only
 * one node */
export interface Visitor {
	visit(node: Element);
  traversalMode: 'breadthFirst' | 'depthFirst';
}