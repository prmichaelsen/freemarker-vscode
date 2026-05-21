/* @scry.entry
 * id: code.freemarker-server-handlers~5d3a4f01
 * kind: code
 * status: active
 * weight: 0.7
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:handlers", "handlers", "freemarker-vscode", "topic:completion", "completion", "topic:hover", "hover"]
 * summary: >
 *   Pure LSP handler helpers for freemarker-vscode — directive/builtin
 *   CompletionItem builders, completion context detection, hover symbol
 *   extraction, hover Markdown formatter, and the high-level
 *   resolveCompletion / resolveHover entry points. Extracted from
 *   server.ts so the connection wiring stays thin and the
 *   computational surface is unit-testable in Jest without spinning
 *   the LSP transport. Also: symbolAtCursor, catalogHoverMarkdown,
 *   directiveCompletionItem, builtinCompletionItem, precedingContext.
 * rationale: Without an extracted module the helpers cannot be imported by Jest without side-effects from server.ts top-level wiring.
 * applies: writing Jest unit tests for completion/hover, refactoring server.ts, extending the LSP handler surface
 * seeded_questions:
 *   - "Where are the FreeMarker LSP completion helpers?"
 *   - "How does symbolAtCursor extract the hovered token?"
 *   - "How does the server detect a directive vs builtin context?"
 *   - "freemarker-vscode handlers module"
 * @scry.entry.end
 */

import {
  CompletionItem,
  CompletionItemKind,
  CompletionList,
  CompletionParams,
  Hover,
  HoverParams,
  InsertTextFormat,
  MarkupKind,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { DIRECTIVES, DirectiveRecord } from './catalog/directives';
import { BUILTINS, BuiltinRecord } from './catalog/builtins';

// ---------------------------------------------------------------------------
// Completion helpers
// ---------------------------------------------------------------------------

/**
 * Returns the substring of `line` immediately preceding `character`, going
 * back at most `n` characters. Used to detect the `<#` / `</#` / `?`
 * trigger context regardless of how the trigger surface fires.
 */
export function precedingContext(
  line: string,
  character: number,
  n = 4,
): string {
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
export function directiveCompletionItem(d: DirectiveRecord): CompletionItem {
  let insertText: string;
  if (d.shape === 'block') {
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
        insertText =
          'switch ${1:expr}>\n\t<#case ${2:value}>\n\t\t$0\n\t\t<#break>\n</#switch>';
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
      value: `**\`${d.signature}\`**\n\n${d.summary}\n\n_Category: ${d.category}_\n\n[Reference](${d.documentationUri})`,
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
export function directiveCompletions(
  doc: TextDocument,
  params: CompletionParams,
): CompletionList | null {
  const line = doc.getText({
    start: { line: params.position.line, character: 0 },
    end: { line: params.position.line, character: params.position.character },
  });
  const prefix = precedingContext(line, params.position.character, 4);

  const opensDirective =
    /<\/?#$/.test(prefix) || /<#[A-Za-z_]*$/.test(prefix);
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
export function builtinCompletionItem(b: BuiltinRecord): CompletionItem {
  return {
    label: b.name,
    kind: CompletionItemKind.Function,
    detail: b.signature,
    documentation: {
      kind: MarkupKind.Markdown,
      value: `**\`${b.signature}\`**\n\n${b.summary}\n\n_Category: ${b.category}_\n\n[Reference](${b.documentationUri})`,
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
export function builtinCompletions(
  doc: TextDocument,
  params: CompletionParams,
): CompletionList | null {
  const line = doc.getText({
    start: { line: params.position.line, character: 0 },
    end: { line: params.position.line, character: params.position.character },
  });
  const opens = /\?([A-Za-z_]*)$/.test(line);
  if (!opens) {
    return null;
  }

  return {
    isIncomplete: false,
    items: BUILTINS.map(builtinCompletionItem),
  };
}

/**
 * High-level completion resolver. Tries the directive branch first,
 * then the built-in branch, then returns null. Pure: no LSP transport
 * dependency.
 */
export function resolveCompletion(
  doc: TextDocument,
  params: CompletionParams,
): CompletionList | null {
  const directives = directiveCompletions(doc, params);
  if (directives) {
    return directives;
  }
  const builtins = builtinCompletions(doc, params);
  if (builtins) {
    return builtins;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Hover helpers
// ---------------------------------------------------------------------------

/**
 * Word-character class used by the hover word-extraction. FreeMarker
 * directive names are all ASCII letters; built-in names additionally
 * use underscores (e.g. `upper_case`, `iso_utc`). Digits never appear
 * in either, so the class stays tight.
 */
export const HOVER_WORD = /[A-Za-z_]/;

/**
 * Extract the symbol the user is hovering and the character that
 * immediately precedes it (the trigger context). Returns `null` if
 * the cursor is not on a word.
 */
export function symbolAtCursor(
  doc: TextDocument,
  params: HoverParams,
): { name: string; trigger: string; precedingTwo: string } | null {
  const line = doc.getText({
    start: { line: params.position.line, character: 0 },
    end: {
      line: params.position.line,
      character: params.position.character + 256,
    },
  });
  const col = params.position.character;
  if (col > line.length) {
    return null;
  }
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
 * The trailing `[Reference](url)` line links out to the canonical
 * freemarker.apache.org reference page for the symbol.
 */
export function catalogHoverMarkdown(
  signature: string,
  summary: string,
  category: string,
  documentationUri: string,
): Hover {
  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: `**\`${signature}\`**\n\n${summary}\n\n_Category: ${category}_\n\n[Reference](${documentationUri})`,
    },
  };
}

/**
 * High-level hover resolver. Pure: no LSP transport dependency.
 * Returns the catalog-driven Hover for the symbol under cursor, or
 * null when the cursor is not on a known directive / builtin.
 */
export function resolveHover(
  doc: TextDocument,
  params: HoverParams,
): Hover | null {
  const sym = symbolAtCursor(doc, params);
  if (!sym) {
    return null;
  }

  const isDirectiveContext =
    sym.precedingTwo === '<#' || sym.precedingTwo.endsWith('/#');
  if (isDirectiveContext) {
    const hit = DIRECTIVES.find((d) => d.name === sym.name);
    if (hit) {
      return catalogHoverMarkdown(
        hit.signature,
        hit.summary,
        hit.category,
        hit.documentationUri,
      );
    }
    return null;
  }

  if (sym.trigger === '?') {
    const hit = BUILTINS.find((b) => b.name === sym.name);
    if (hit) {
      return catalogHoverMarkdown(
        hit.signature,
        hit.summary,
        hit.category,
        hit.documentationUri,
      );
    }
    return null;
  }

  return null;
}
