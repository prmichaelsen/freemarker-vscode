import {
  CancellationToken, DocumentSemanticTokensProvider, Event, ProviderResult, Range,
  SemanticTokens, SemanticTokensBuilder, SemanticTokensEdits, SemanticTokensLegend,
  TextDocument
} from 'vscode';

export const tokenTypes = {
  comment: 0, string: 1, keyword: 2, number: 3, regexp: 4, operator: 5, namespace: 6, type: 7,
  struct: 8, class: 9, interface: 10, enum: 11, enumMember: 12, typeParameter: 13, function: 14,
  method: 15, decorator: 16, variable: 17, parameter: 18, property: 19, label: 20
}
export const tokenModifiers = {
  declaration: 0, documentation: 1, readonly: 2, static: 3, abstract: 4, deprecated: 5,
  modification: 6, async: 7, defaultLibrary: 8
}
export const legend: SemanticTokensLegend = {
  tokenTypes: Object.keys(tokenTypes),
  tokenModifiers: Object.keys(tokenModifiers),
};

export class FreeMarkerSemanticTokensProvider implements DocumentSemanticTokensProvider {
  onDidChangeSemanticTokens?: Event<void>;
  async provideDocumentSemanticTokens(document: TextDocument, token: CancellationToken): Promise<SemanticTokens> {
    return await buildSemanticTokens(document);
  }
  provideDocumentSemanticTokensEdits?(document: TextDocument, previousResultId: string, token: CancellationToken): ProviderResult<SemanticTokens | SemanticTokensEdits> {
    throw new Error('Method not implemented.');
  }
}

export const buildSemanticTokens = async (document: TextDocument): Promise<SemanticTokens> => {
	const tokensBuilder: SemanticTokensBuilder = new SemanticTokensBuilder(legend);

  const text = document.getText();
  const macroRegex = /\$\{(.+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = macroRegex.exec(text)) !== null) {
    const name = match[1];
    const start = match.index;
    const end = start + match[0].length;
    const openRange = new Range(document.positionAt(start), document.positionAt(start + 2));
    const varRange = new Range(document.positionAt(start + 2), document.positionAt(end - 1));
    const closeRange = new Range(document.positionAt(end - 1), document.positionAt(end));
    tokensBuilder.push(
      openRange.start.line,
      openRange.start.character,
      openRange.end.character - openRange.start.character,
      tokenTypes.operator,
      -1,
    );
    tokensBuilder.push(
      varRange.start.line,
      varRange.start.character,
      varRange.end.character - varRange.start.character,
      tokenTypes.variable,
      -1,
    );
    tokensBuilder.push(
      closeRange.start.line,
      closeRange.start.character,
      closeRange.end.character - closeRange.start.character,
      tokenTypes.operator,
      -1,
    );
  }

  return tokensBuilder.build();;
}