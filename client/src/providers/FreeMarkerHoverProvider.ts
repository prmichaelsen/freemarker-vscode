import * as path from "node:path";
import { CancellationToken, Hover, HoverProvider, MarkdownString, Position, Range, TextDocument, Uri, workspace } from 'vscode';
import { getDocumentHash } from '../components/intern/getDocumentHash';
import { DocumentManager } from '../components/managers/DocumentManager';
import { FreeMarkerTokenizer } from '../components/parser/FreeMarkerTokenizer';
import { closeClose, closeOpen, commentClose, commentOpen, userDefinedDirectiveOpenOpen } from '../components/parser/grammar';
import { Token } from '../components/parser/Token';
import { Metrics } from '../components/telemetry/Metrics';
import { Telemetry } from '../components/telemetry/Telemetry';
import { toRange } from '../components/vscode/toRange';
import { registerHandlers } from '../lib/vscode/Watcher';

export type DocumentCacheKey = string;
export interface HoverCacheEntry {
  range: Range;
  hover: Hover;
};
export interface DocumentCacheEntry {
  hash: string;
  hoverCache: HoverCacheEntry[];
}
export interface HoverInfo extends Hover {
  cacheable?: boolean;
}
export type HoverCache = Record<DocumentCacheKey, DocumentCacheEntry>;

export class FreeMarkerHoverProvider implements HoverProvider {
  private documentCache: Record<DocumentCacheKey, DocumentCacheEntry> = {};
  private disposables: { dispose(): void }[] = [];
  private contentCache: Record<string, string> = {};

  constructor() {
    const idPrefix = "FreeMarkerHoverProvider";
    this.disposables.push(registerHandlers(
      { name: idPrefix, type: 'onDidCreate', event: this.handleCreatedFile },
      { name: idPrefix, type: 'onDidDelete', event: this.handleDeletedFile },
      { name: idPrefix, type: 'onDidChange', event: this.handleChangedFile },
    ));
    this.findFiles().then(uris => {
      for (const uri of uris) {
        this.setHovers(uri);
      }
    });
  }

  async findFiles(): Promise<Uri[]> {
    const uris: Uri[] = [];
    const fp = path.join(
      '**',
      '*.ftl',
    );
    uris.push(...await workspace.findFiles(fp));
    return uris;
  }

  private handleCreatedFile = async (uri: Uri) => {
    this.setHovers(uri);
  }

  private handleChangedFile = async (uri: Uri) => {
    try {
      this.setHovers(uri);
    } catch (e) {
      console.error(e);
    }
  }

  private handleDeletedFile = async (uri: Uri) => {
  }

  private async setHovers(uri: Uri) {
    const document = await workspace.openTextDocument(uri);
    const text = document.getText();
    const tokenizer = new FreeMarkerTokenizer(text);
    const tokens = tokenizer.tokenize();

    const idxs: number[] = [];
    for (const idx in tokens) {
      const token = tokens[idx];
      if (token.value === "macro") {
        idxs.push(parseInt(idx) - 1);
      }
    }

    for (const idx of idxs) {
      const commentCloseToken = this.findToken(tokens, idx, 'back', commentClose);
      let comment: string = '';
      if (commentCloseToken?.value === commentClose) {
        const commentOpenToken = this.findToken(tokens, idx, 'back', commentOpen);
        comment = text.substring(commentOpenToken.index!, commentCloseToken.index! + commentCloseToken.value.length);
      }
      const openMacroToken = tokens[idx];
      const parts = tokens[idx + 2]?.value;
      if (!parts) {
        continue;
      }
      const endToken = this.findToken(tokens, idx + 1, 'forward', "macro");
      if (!endToken) {
        continue;
      }
      const content = text.substring(openMacroToken.index!, endToken.index! + endToken.value.length);
      const name = parts.trim().split(' ')[0];
      this.contentCache[name] = [
        "```ftl",
        comment,
        content + closeOpen,
        "```",
      ].join("\n");
    }
  }

  private getDocumentCacheKey = (document: TextDocument): string => {
    return `${document.uri.toString()}`;
  }

  async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover> {
    const text = document.getText();
    const hash = getDocumentHash(text);
    const documentCacheKey = this.getDocumentCacheKey(document);
    const documentCacheEntry = this.documentCache[documentCacheKey] || {
      hash, hoverCache: []
    };

    if (hash !== documentCacheEntry.hash) {
      this.documentCache[documentCacheKey] = {
        hash,
        hoverCache: [],
      };
    } else {
      this.documentCache[documentCacheKey] = documentCacheEntry;
    }

    let hover: HoverInfo;
    const hoverCache = documentCacheEntry.hoverCache || [];
    for (const hoverCacheEntry of hoverCache) {
      if (hoverCacheEntry.range.contains(position)) {
        hover = hoverCacheEntry.hover;
        Telemetry.publish([{
          MetricName: Metrics.Hover.Cache.Hit,
          Unit: 'Count',
          Value: 1,
        }]);
        break;
      }
    }

    if (!hover) {
      Telemetry.publish([{
        MetricName: Metrics.Hover.Cache.Miss,
        Unit: 'Count',
        Value: 1,
      }]);
      hover = await this.buildHover(document, position);
      if (hover?.cacheable !== false) {
        hoverCache.push({
          range: hover.range,
          hover,
        });
      }
    }

    if (!hover) {
      Telemetry.publish([{
        MetricName: Metrics.Hover.NotFound,
        Unit: 'Count',
        Value: 1,
      }]);
      return null;
    }

    Telemetry.publish([{
      MetricName: Metrics.Hover.Found,
      Unit: 'Count',
      Value: 1,
    }]);
    return hover;
  }

  private findToken(tokens: Token[], idx: number, direction: 'forward' | 'back', search: string): Token | null {
    if (direction === 'forward') {
      for (let i = idx + 1; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.value === search) {
          return token;
        }
      }
    } else if (direction === 'back') {
      for (let i = idx - 1; i >= 0; i--) {
        const token = tokens[i];
        if (token.value === search) {
          return token;
        }
      }
    }
    return null;
  }


  dispose() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  private async buildHover(document: TextDocument, position: Position): Promise<HoverInfo | null> {
    const text = document.getText();
    const tokenizer = new FreeMarkerTokenizer(text);
    const tokens = tokenizer.tokenize();
    const documentManager = new DocumentManager(document);
    const subjectIdx = tokens.findIndex(token => {
      const rangeObject = documentManager.getTokenRange(token);
      if (!rangeObject) {
        return false;
      }
      const range = toRange(rangeObject);
      if (!range) {
        return false;
      }
      return range.contains(position);
    });
    const subject = tokens[subjectIdx];
    const prev = tokens[subjectIdx - 1];
    if (!subject || !prev) {
      return null;
    }
    let valid = false;
    if (prev.value === userDefinedDirectiveOpenOpen) {
      valid = true;
    }

    if (!valid) {
      return null;
    }

    const content = this.contentCache[subject.value];
    const hoverStr = new MarkdownString(content);
    return {
      range: toRange(documentManager.getTokenRange(subject)),
      contents: [hoverStr],
      cacheable: true,
    }
  }
}