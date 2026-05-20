/* @scry.entry
 * id: code.freemarker-handlers-test~7c4180bd
 * kind: code
 * status: active
 * weight: 0.6
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:handlers", "handlers", "topic:test", "test", "jest", "topic:hover", "hover", "topic:completion", "completion"]
 * summary: >
 *   Jest unit tests for the pure freemarker-vscode LSP handler
 *   surface — symbolAtCursor (word extraction with trigger /
 *   precedingTwo context), catalogHoverMarkdown (signature/summary/
 *   category Markdown layout), resolveHover (directive + builtin
 *   resolution), resolveCompletion (directive + builtin completion
 *   list emission). Also: handlers jest tests, symbolAtCursor test,
 *   hover resolver test, completion resolver test.
 * rationale: Without these tests a regression in word extraction, trigger detection, or catalog lookup ships silently — the integration harness is much slower and exercises the same surface less precisely.
 * applies: editing handlers.ts, regressing completion/hover, evolving the trigger-detection logic
 * seeded_questions:
 *   - "How is symbolAtCursor unit-tested?"
 *   - "Where are the catalogHoverMarkdown tests?"
 *   - "freemarker-vscode handlers jest tests"
 * @scry.entry.end
 */

import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  catalogHoverMarkdown,
  resolveCompletion,
  resolveHover,
  symbolAtCursor,
} from './handlers';

function makeDoc(content: string): TextDocument {
  return TextDocument.create('file:///test.ftl', 'ftl', 1, content);
}

function pos(line: number, character: number) {
  return { line, character };
}

describe('symbolAtCursor', () => {
  test('extracts a word in the middle of a line', () => {
    const doc = makeDoc('<#if condition>');
    // cursor inside `if`
    const sym = symbolAtCursor(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 3),
    });
    expect(sym).not.toBeNull();
    expect(sym!.name).toBe('if');
    expect(sym!.precedingTwo).toBe('<#');
  });

  test('extracts a builtin name after `?`', () => {
    const doc = makeDoc('${user.name?upper_case}');
    // cursor inside `upper_case`
    const sym = symbolAtCursor(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 15),
    });
    expect(sym).not.toBeNull();
    expect(sym!.name).toBe('upper_case');
    expect(sym!.trigger).toBe('?');
  });

  test('recognises closing-tag directive context (</#name)', () => {
    const doc = makeDoc('</#if>');
    const sym = symbolAtCursor(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 4),
    });
    expect(sym).not.toBeNull();
    expect(sym!.name).toBe('if');
    expect(sym!.precedingTwo).toBe('/#');
  });

  test('returns null when cursor is not on a word', () => {
    const doc = makeDoc('   ');
    const sym = symbolAtCursor(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 1),
    });
    expect(sym).toBeNull();
  });

  test('handles start-of-line word', () => {
    const doc = makeDoc('if');
    const sym = symbolAtCursor(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 1),
    });
    expect(sym).not.toBeNull();
    expect(sym!.name).toBe('if');
    expect(sym!.trigger).toBe('');
  });

  test('extracts underscore-bearing names', () => {
    const doc = makeDoc('x?index_of("y")');
    const sym = symbolAtCursor(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 5),
    });
    expect(sym).not.toBeNull();
    expect(sym!.name).toBe('index_of');
    expect(sym!.trigger).toBe('?');
  });
});

describe('catalogHoverMarkdown', () => {
  test('emits signature/summary/category Markdown', () => {
    const hover = catalogHoverMarkdown(
      '<#if expr>...</#if>',
      'Conditionally include content based on a boolean expression.',
      'flow-control',
    );
    expect(hover.contents).toEqual({
      kind: 'markdown',
      value:
        '**`<#if expr>...</#if>`**\n\nConditionally include content based on a boolean expression.\n\n_Category: flow-control_',
    });
  });
});

describe('resolveHover', () => {
  test('resolves a directive hover (<#if>)', () => {
    const doc = makeDoc('<#if foo>bar</#if>');
    const hover = resolveHover(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 3), // inside `if`
    });
    expect(hover).not.toBeNull();
    const md = (hover!.contents as { value: string }).value;
    expect(md).toContain('Conditionally include content');
    expect(md).toContain('_Category: flow-control_');
  });

  test('resolves a builtin hover (?upper_case)', () => {
    const doc = makeDoc('${x?upper_case}');
    const hover = resolveHover(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 8),
    });
    expect(hover).not.toBeNull();
    const md = (hover!.contents as { value: string }).value;
    expect(md).toContain('Convert the operand string to upper case');
  });

  test('returns null for an unknown directive name', () => {
    const doc = makeDoc('<#notADirective>');
    const hover = resolveHover(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 5),
    });
    expect(hover).toBeNull();
  });

  test('returns null when not on a word', () => {
    const doc = makeDoc('plain text only');
    const hover = resolveHover(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 5),
    });
    // 'text' is a plain word with no trigger; resolveHover should not
    // claim a directive / builtin hit for it.
    expect(hover).toBeNull();
  });
});

describe('resolveCompletion', () => {
  test('returns directive items after `<#`', () => {
    const doc = makeDoc('<#');
    const list = resolveCompletion(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 2),
    });
    expect(list).not.toBeNull();
    const labels = list!.items.map((i) => i.label);
    expect(labels).toContain('if');
    expect(labels).toContain('list');
    expect(labels).toContain('macro');
  });

  test('returns directive items mid-name (<#li|)', () => {
    const doc = makeDoc('<#li');
    const list = resolveCompletion(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 4),
    });
    expect(list).not.toBeNull();
    expect(list!.items.some((i) => i.label === 'list')).toBe(true);
  });

  test('returns builtin items after `?`', () => {
    const doc = makeDoc('${x?');
    const list = resolveCompletion(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 4),
    });
    expect(list).not.toBeNull();
    const labels = list!.items.map((i) => i.label);
    expect(labels).toContain('upper_case');
    expect(labels).toContain('size');
  });

  test('returns null in plain text context', () => {
    const doc = makeDoc('hello world');
    const list = resolveCompletion(doc, {
      textDocument: { uri: doc.uri },
      position: pos(0, 5),
    });
    expect(list).toBeNull();
  });
});
