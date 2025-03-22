import { BaseElement } from '../parser/node/Element';

/** 
 * Pass mutators to the parser to perform
 * optional mutations on the parse tree.
 */
export interface Mutator {
	mutate(node: BaseElement);
}