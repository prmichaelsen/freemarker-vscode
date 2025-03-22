import { Element } from '../parser/node/Element';

export class FilterManager {
  private elements: Record<string, Element[]> = {};
  constructor(
    private filters: Record<string, (element: Element) => boolean>,
  ) {
    for (const filter in this.filters) {
      this.elements[filter] = [];
    }
  }
  public matches() {
    return this.elements;
  }
  public filter(element: Element) {
    for (const filter in this.filters) {
      if (this.filters[filter](element)) {
        this.elements[filter].push(element);
      }
    }
  }
}