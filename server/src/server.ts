/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  CompletionList,
  CompletionParams,
  Hover,
  HoverParams,
  InsertTextFormat,
  MarkupKind,
  TextDocumentSyncKind,
  InitializeResult,
  DocumentDiagnosticReportKind,
  type DocumentDiagnosticReport,
} from 'vscode-languageserver/node';

import {
  TextDocument,
} from 'vscode-languageserver-textdocument';

import { DIRECTIVES, DirectiveRecord } from './catalog/directives';
import { BUILTINS, BuiltinRecord } from './catalog/builtins';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// https://github.com/microsoft/vscode-languageserver-node/blob/main/client-node-tests/src/servers/testServer.ts
// https://vshaxe.github.io/vscode-extern/vscode
connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
      // Phase 1 wake 1: directive autocomplete. `?` is wired as a
      // trigger character now so that the next wake landing built-in
      // completion only needs to add the provider branch — the
      // capability surface does not need to change.
      completionProvider: {
        triggerCharacters: ['#', '?'],
        resolveProvider: false,
      },
      // Phase 1 wake 2: catalog-fed hover lives on the server. The
      // client-side FreeMarkerHoverProvider retired in this release;
      // the LSP boundary is the source of truth for directive and
      // built-in hover content.
      hoverProvider: true,
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});


connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

connection.onDidChangeConfiguration(change => {
  connection.languages.diagnostics.refresh();
});

// Only keep settings for open documents
documents.onDidClose(e => {
});

connection.languages.diagnostics.on(async (params) => {
  documents.get(params.textDocument.uri);
  try {
    connection.sendRequest('freemarker/diagnostics', {
      uri: params.textDocument.uri,
    });
  } catch (e) {
    console.log(e);
  }
  return {
    kind: DocumentDiagnosticReportKind.Full,
    items: [],
  } satisfies DocumentDiagnosticReport;
});


// ---------------------------------------------------------------------------
// Completion — Phase 1 wake 1
// ---------------------------------------------------------------------------

/**
 * Returns the substring of `line` immediately preceding `character`, going
 * back at most `n` characters. Used to detect the `<#` / `</#` / `?`
 * trigger context regardless of how the trigger surface fires.
 */
function precedingContext(line: string, character: number, n = 4): string {
  const start = Math.max(0, character - n);
  return line.slice(start, character);
}

/**
 * Build a CompletionItem for a directive record.
 *
 * The insertText assumes the user has already typed `<#` (the trigger),
 * so the snippet body picks up immediately after the `#`. Block
 * directives get a body placeholder and a matching close tag; inline
 * directives close themselves.
 */
function directiveCompletionItem(d: DirectiveRecord): CompletionItem {
  let insertText: string;
  if (d.shape === 'block') {
    // Special-case directives whose body benefits from a parameter
    // placeholder in the open tag.
    switch (d.name) {
      case 'if':
        insertText = 'if ${1:condition}>\n\t$0\n</#if>';
        break;
      case 'list':
        insertText = 'list ${1:seq} as ${2:item}>\n\t$0\n</#list>';
        break;
      case 'macro':
        insertText = 'macro ${1:name}${2: params}>\n\t$0\n</#macro>';
        break;
      case 'function':
        insertText = 'function ${1:name}(${2:params})>\n\t$0\n</#function>';
        break;
      case 'switch':
        insertText = 'switch ${1:expr}>\n\t<#case ${2:value}>\n\t\t$0\n\t\t<#break>\n</#switch>';
        break;
      case 'attempt':
        insertText = 'attempt>\n\t${1:body}\n<#recover>\n\t$0\n</#attempt>';
        break;
      case 'escape':
        insertText = 'escape ${1:x} as ${2:expr(x)}>\n\t$0\n</#escape>';
        break;
      case 'outputformat':
        insertText = 'outputformat "${1:HTML}">\n\t$0\n</#outputformat>';
        break;
      default:
        insertText = `${d.name}>\n\t$0\n</#${d.name}>`;
        break;
    }
  } else {
    // Inline directives — let the user keep typing inside the tag if
    // the signature carries parameters.
    switch (d.name) {
      case 'assign':
      case 'local':
      case 'global':
        insertText = `${d.name} \${1:name}=\${2:value}>$0`;
        break;
      case 'include':
        insertText = `include "\${1:path}">$0`;
        break;
      case 'import':
        insertText = `import "\${1:path}" as \${2:ns}>$0`;
        break;
      case 'setting':
        insertText = `setting \${1:name}=\${2:value}>$0`;
        break;
      case 'stop':
        insertText = `stop "\${1:reason}">$0`;
        break;
      case 'ftl':
        insertText = `ftl \${1:encoding="UTF-8"}>$0`;
        break;
      case 'nested':
        insertText = `nested\${1: loopvars}>$0`;
        break;
      case 'else':
      case 'recover':
      case 'default':
      case 'break':
      case 'continue':
      case 'return':
      case 't':
      case 'lt':
      case 'rt':
      case 'nt':
        insertText = `${d.name}>$0`;
        break;
      case 'elseif':
        insertText = `elseif \${1:condition}>$0`;
        break;
      case 'case':
        insertText = `case \${1:value}>$0`;
        break;
      default:
        insertText = `${d.name}>$0`;
        break;
    }
  }

  return {
    label: d.name,
    kind: CompletionItemKind.Keyword,
    detail: d.signature,
    documentation: {
      kind: MarkupKind.Markdown,
      value: `**\`${d.signature}\`**\n\n${d.summary}\n\n_Category: ${d.category}_`,
    },
    insertText,
    insertTextFormat: InsertTextFormat.Snippet,
    sortText: `0_${d.name}`,
    filterText: d.name,
    data: { kind: 'directive', name: d.name, category: d.category },
  };
}

/**
 * Build the directive completion list for the current cursor position.
 * Returns `null` when the context does not look like a directive
 * trigger — VS Code falls back to other providers (e.g. snippets,
 * word-based) in that case.
 */
function directiveCompletions(
  doc: TextDocument,
  params: CompletionParams,
): CompletionList | null {
  const line = doc.getText({
    start: { line: params.position.line, character: 0 },
    end: { line: params.position.line, character: params.position.character },
  });
  const prefix = precedingContext(line, params.position.character, 4);

  // Fire on `<#` or `</#`. The trigger character is `#`, but completion
  // may also fire by invoke (Ctrl-Space) — re-check the context.
  const opensDirective = /<\/?#$/.test(prefix) || /<#[A-Za-z_]*$/.test(prefix);
  if (!opensDirective) {
    return null;
  }

  return {
    isIncomplete: false,
    items: DIRECTIVES.map(directiveCompletionItem),
  };
}

/**
 * Build a CompletionItem for a built-in record. The user has typed `?`
 * (the trigger); the snippet body picks up immediately after it.
 */
function builtinCompletionItem(b: BuiltinRecord): CompletionItem {
  return {
    label: b.name,
    kind: CompletionItemKind.Function,
    detail: b.signature,
    documentation: {
      kind: MarkupKind.Markdown,
      value: `**\`${b.signature}\`**\n\n${b.summary}\n\n_Category: ${b.category}_`,
    },
    insertText: b.name,
    insertTextFormat: InsertTextFormat.PlainText,
    sortText: `0_${b.name}`,
    filterText: b.name,
    data: { kind: 'builtin', name: b.name, category: b.category },
  };
}

/**
 * Build the built-in completion list for the current cursor position.
 * Fires when the cursor sits immediately after a `?` (the trigger) or
 * inside a `?name` fragment the user is partway through typing.
 * Returns `null` when the context does not look like a built-in
 * invocation.
 */
function builtinCompletions(
  doc: TextDocument,
  params: CompletionParams,
): CompletionList | null {
  const line = doc.getText({
    start: { line: params.position.line, character: 0 },
    end: { line: params.position.line, character: params.position.character },
  });
  // Scan back to the nearest `?` on the line. Accept the context iff
  // the run from `?` to cursor is empty or [A-Za-z_]+. Anything else
  // (whitespace, punctuation, second `?`) means the cursor is no
  // longer in a built-in fragment.
  const opens = /\?([A-Za-z_]*)$/.test(line);
  if (!opens) {
    return null;
  }

  return {
    isIncomplete: false,
    items: BUILTINS.map(builtinCompletionItem),
  };
}

connection.onCompletion((params: CompletionParams): CompletionList | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    return null;
  }
  const directives = directiveCompletions(doc, params);
  if (directives) {
    return directives;
  }
  const builtins = builtinCompletions(doc, params);
  if (builtins) {
    return builtins;
  }
  return null;
});


// ---------------------------------------------------------------------------
// Hover — Phase 1 wake 2
// ---------------------------------------------------------------------------

/**
 * Word-character class used by the hover word-extraction. FreeMarker
 * directive names are all ASCII letters; built-in names additionally
 * use underscores (e.g. `upper_case`, `iso_utc`). Digits never appear
 * in either, so the class stays tight.
 */
const HOVER_WORD = /[A-Za-z_]/;

/**
 * Extract the symbol the user is hovering and the character that
 * immediately precedes it (the trigger context). Returns `null` if
 * the cursor is not on a word.
 */
function symbolAtCursor(
  doc: TextDocument,
  params: HoverParams,
): { name: string; trigger: string; precedingTwo: string } | null {
  const line = doc.getText({
    start: { line: params.position.line, character: 0 },
    // Read a wide chunk past the cursor so the symbol's right edge
    // doesn't get cropped on long words near column zero.
    end: { line: params.position.line, character: params.position.character + 256 },
  });
  const col = params.position.character;
  if (col > line.length) {
    return null;
  }
  // Walk left and right from the cursor while we're inside a word.
  let start = col;
  while (start > 0 && HOVER_WORD.test(line[start - 1] ?? '')) {
    start--;
  }
  let end = col;
  while (end < line.length && HOVER_WORD.test(line[end] ?? '')) {
    end++;
  }
  if (start === end) {
    return null;
  }
  const name = line.slice(start, end);
  const trigger = start > 0 ? line[start - 1] : '';
  const precedingTwo = line.slice(Math.max(0, start - 2), start);
  return { name, trigger, precedingTwo };
}

/**
 * Format the Markdown body for a catalog hit. Mirrors the layout used
 * by completion items so completion + hover speak with one voice.
 */
function catalogHoverMarkdown(
  signature: string,
  summary: string,
  category: string,
): Hover {
  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: `**\`${signature}\`**\n\n${summary}\n\n_Category: ${category}_`,
    },
  };
}

connection.onHover((params: HoverParams): Hover | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    return null;
  }
  const sym = symbolAtCursor(doc, params);
  if (!sym) {
    return null;
  }

  // Directive context: word follows `<#` or `</#`. We check the
  // two-char preceding window so both `<#if` and `</#if` resolve.
  const isDirectiveContext =
    sym.precedingTwo === '<#' || sym.precedingTwo.endsWith('/#');
  if (isDirectiveContext) {
    const hit = DIRECTIVES.find((d) => d.name === sym.name);
    if (hit) {
      return catalogHoverMarkdown(hit.signature, hit.summary, hit.category);
    }
    return null;
  }

  // Built-in context: word follows a single `?`.
  if (sym.trigger === '?') {
    const hit = BUILTINS.find((b) => b.name === sym.name);
    if (hit) {
      return catalogHoverMarkdown(hit.signature, hit.summary, hit.category);
    }
    return null;
  }

  return null;
});


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
