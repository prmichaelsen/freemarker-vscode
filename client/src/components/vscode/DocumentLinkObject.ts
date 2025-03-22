import { RangeObject } from './RangeObject';

export interface DocumentLinkObject {
  key: string;
  range: RangeObject;
  /** source uri */
  uri: string;
  /** target uri */
  target?: string;
}