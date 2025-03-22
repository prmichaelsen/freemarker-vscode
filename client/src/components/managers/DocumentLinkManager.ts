import { deepDedupe } from '../extern/dedupe';
import { DocumentLinkObject } from '../vscode/DocumentLinkObject';

export class DocumentLinkManager {
  private promises: Record<string, Promise<string>> = {};
  private documentLinkCache: Record<string, string> = {};

  public constructor(
    private documentLinkObjects: DocumentLinkObject[] = []
  ) {}

  public push(...documentLinkObjects: DocumentLinkObject[]) {
    this.documentLinkObjects = deepDedupe(
      ...this.documentLinkObjects,
      ...documentLinkObjects.filter(link => link !== null)
    );
  }

  public links(uri: string) { 
    return this.documentLinkObjects.filter(o => o.uri === uri);
  };

  public register(key: string, promise: Promise<string>) {
    this.promises[key] = promise;
  }
  
  public clear() {
    this.promises = {};
    this.documentLinkCache = {};
    this.documentLinkObjects = [];
  }

  public async resolve(key: string): Promise<string | null> {
    if (this.documentLinkCache[key]) {
      return this.documentLinkCache[key];
    }
    const promise = this.promises[key];
    if (!promise) {
      return null;
    }
    delete this.promises[key];
    const result = await promise;
    this.documentLinkCache[key] = result;
    return result;
  }
}