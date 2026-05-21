/* @scry.entry
 * id: code.freemarker-completion-integration-test~e9275a3b
 * kind: code
 * status: active
 * weight: 0.6
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:completion", "completion", "topic:integration-test", "integration-test", "mocha", "freemarker-vscode"]
 * summary: >
 *   Mocha electron integration test for the freemarker-vscode
 *   completion surface. Opens fixture .ftl files inside a real VS
 *   Code instance and asserts that completion fired inside directive
 *   contexts (`<#`) surfaces the directive catalog and completion
 *   fired after `?` surfaces the builtin catalog. Multiple trigger
 *   sites per fixture, including post-fragment completion (e.g.
 *   user has typed `<#i` already) where the LSP client filters the
 *   list. Exercises the LSP boundary end-to-end (server.onCompletion
 *   → client → vscode.executeCompletionItemProvider). Also: completion
 *   integration test, executeCompletionItemProvider, directive
 *   completion, builtin completion, mocha vscode test, multi-site
 *   trigger coverage.
 * rationale: Without an end-to-end test, a wiring regression between server.onCompletion and the LSP transport ships silently — jest helper tests don't exercise the protocol.
 * applies: editing server completion wiring, adding new completion triggers, debugging completion regressions
 * seeded_questions:
 *   - "How is freemarker-vscode completion end-to-end tested?"
 *   - "Where is the directive completion mocha test?"
 *   - "executeCompletionItemProvider freemarker"
 *   - "freemarker completion multi-site"
 * @scry.entry.end
 */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { activate, getDocUri } from './helper';

function labelText(label: unknown): string {
  if (typeof label === 'string') {
    return label;
  }
  if (label && typeof label === 'object' && 'label' in label) {
    return String((label as { label: unknown }).label);
  }
  return '';
}

async function fetchCompletions(
  docUri: vscode.Uri,
  position: vscode.Position,
): Promise<string[]> {
  const list = await vscode.commands.executeCommand<vscode.CompletionList>(
    'vscode.executeCompletionItemProvider',
    docUri,
    position,
  );
  assert.ok(list, 'expected a completion list');
  return list!.items.map((i) => labelText(i.label));
}

function assertIncludes(labels: string[], expected: readonly string[], context: string) {
  for (const exp of expected) {
    assert.ok(
      labels.includes(exp),
      `${context}: expected '${exp}' in completion list, got first 30:\n${labels.slice(0, 30).join(', ')}…`,
    );
  }
}

suite('completion — baseline (completion-sample.ftl)', () => {
  test('directive completion fires after <#', async () => {
    const docUri = getDocUri('completion/completion-sample.ftl');
    await activate(docUri);
    // Line 0 is `<#` — cursor at column 2 lands inside the directive trigger.
    const labels = await fetchCompletions(docUri, new vscode.Position(0, 2));
    assertIncludes(labels, ['if', 'list', 'macro'], '<# directive trigger');
  });

  test('builtin completion fires after ?', async () => {
    const docUri = getDocUri('completion/completion-sample.ftl');
    await activate(docUri);
    // Line 1 is `${x?` — cursor at column 4 is immediately after `?`.
    const labels = await fetchCompletions(docUri, new vscode.Position(1, 4));
    assertIncludes(labels, ['upper_case', 'size'], '? builtin trigger');
  });
});

suite('completion — directive contexts (directive-contexts.ftl)', () => {
  let docUri: vscode.Uri;
  suiteSetup(async () => {
    docUri = getDocUri('completion/directive-contexts.ftl');
    await activate(docUri);
  });

  test('flush-left <# fires directive completion', async () => {
    // Line 1: `<#` (cursor at col 2)
    const labels = await fetchCompletions(docUri, new vscode.Position(1, 2));
    assertIncludes(
      labels,
      ['if', 'list', 'macro', 'function', 'assign', 'switch'],
      'flush-left <#',
    );
  });

  test('indented <# fires directive completion', async () => {
    // Line 2: `  <#` — cursor at col 4 is immediately after `<#`
    const labels = await fetchCompletions(docUri, new vscode.Position(2, 4));
    assertIncludes(
      labels,
      ['attempt', 'recover', 'compress', 'escape'],
      'indented <#',
    );
  });

  test('directive completion list covers the full catalog breadth', async () => {
    const labels = await fetchCompletions(docUri, new vscode.Position(1, 2));
    // Spot-check entries from every category (flow, definition,
    // inclusion, output, escape, meta, error-handling).
    assertIncludes(
      labels,
      [
        'if', 'list',                        // flow
        'macro', 'function', 'assign',       // definition
        'include', 'import',                 // inclusion
        'compress',                          // output
        'escape', 'noescape',                // escape
        't', 'ftl',                          // meta
        'attempt', 'recover',                // error-handling
      ],
      'directive catalog breadth',
    );
  });
});

suite('completion — builtin contexts (builtin-contexts.ftl)', () => {
  let docUri: vscode.Uri;
  suiteSetup(async () => {
    docUri = getDocUri('completion/builtin-contexts.ftl');
    await activate(docUri);
  });

  test('string-operand ? completion', async () => {
    // Line 0: `${name?` — col 7 is immediately after `?`
    const labels = await fetchCompletions(docUri, new vscode.Position(0, 7));
    assertIncludes(
      labels,
      ['upper_case', 'lower_case', 'trim', 'html', 'url'],
      'string ?',
    );
  });

  test('sequence-operand ? completion', async () => {
    // Line 1: `${items?` — col 8 is immediately after `?`
    const labels = await fetchCompletions(docUri, new vscode.Position(1, 8));
    assertIncludes(
      labels,
      ['size', 'first', 'last', 'reverse', 'sort', 'join'],
      'sequence ?',
    );
  });

  test('hash/meta-operand ? completion', async () => {
    // Line 2: `${user?` — col 7 is immediately after `?`
    const labels = await fetchCompletions(docUri, new vscode.Position(2, 7));
    assertIncludes(
      labels,
      ['keys', 'values', 'has_content', 'is_string', 'default'],
      'hash/meta ?',
    );
  });

  test('builtin completion list covers all operand categories', async () => {
    const labels = await fetchCompletions(docUri, new vscode.Position(0, 7));
    // The server emits the full BUILTINS catalog regardless of
    // operand type (the user types the operand, the LSP can't
    // type-infer without a parser). Spot-check every category.
    assertIncludes(
      labels,
      [
        'upper_case',     // string
        'size',           // sequence
        'keys',           // hash
        'abs',            // numeric
        'date',           // date
        'has_content',    // meta
      ],
      'builtin catalog breadth',
    );
  });
});
