/* @scry.entry
 * id: code.freemarker-completion-integration-test~e9275a3b
 * kind: code
 * status: active
 * weight: 0.6
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:completion", "completion", "topic:integration-test", "integration-test", "mocha", "freemarker-vscode"]
 * summary: >
 *   Mocha electron integration test for the freemarker-vscode
 *   completion surface. Opens a fixture .ftl file inside a real
 *   VS Code instance and asserts that completion fired inside a
 *   directive context (`<#`) surfaces directive items (`if`,
 *   `list`, `macro`) and completion fired after `?` surfaces
 *   builtin items (`upper_case`, `size`). Exercises the LSP boundary
 *   end-to-end (server.onCompletion → client →
 *   vscode.executeCompletionItemProvider). Also: completion
 *   integration test, executeCompletionItemProvider, directive
 *   completion, builtin completion, mocha vscode test.
 * rationale: Without an end-to-end test, a wiring regression between server.onCompletion and the LSP transport ships silently — jest helper tests don't exercise the protocol.
 * applies: editing server completion wiring, adding new completion triggers, debugging completion regressions
 * seeded_questions:
 *   - "How is freemarker-vscode completion end-to-end tested?"
 *   - "Where is the directive completion mocha test?"
 *   - "executeCompletionItemProvider freemarker"
 * @scry.entry.end
 */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { activate, getDocUri } from './helper';

suite('completion', () => {
  test('directive completion fires after <#', async () => {
    const docUri = getDocUri('completion/completion-sample.ftl');
    await activate(docUri);

    // Line 0 is `<#` — cursor at column 2 lands inside the directive
    // trigger context.
    const list =
      await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider',
        docUri,
        new vscode.Position(0, 2),
      );

    assert.ok(list, 'expected a completion list');
    const labels = list!.items.map((i) => labelText(i.label));
    for (const expected of ['if', 'list', 'macro']) {
      assert.ok(
        labels.includes(expected),
        `expected directive '${expected}' in completion list, got:\n${labels.join(', ')}`,
      );
    }
  });

  test('builtin completion fires after ?', async () => {
    const docUri = getDocUri('completion/completion-sample.ftl');
    await activate(docUri);

    // Line 1 is `${x?` — cursor at column 4 lands immediately after `?`.
    const list =
      await vscode.commands.executeCommand<vscode.CompletionList>(
        'vscode.executeCompletionItemProvider',
        docUri,
        new vscode.Position(1, 4),
      );

    assert.ok(list, 'expected a completion list');
    const labels = list!.items.map((i) => labelText(i.label));
    for (const expected of ['upper_case', 'size']) {
      assert.ok(
        labels.includes(expected),
        `expected builtin '${expected}' in completion list, got:\n${labels.slice(0, 20).join(', ')}…`,
      );
    }
  });
});

function labelText(label: unknown): string {
  if (typeof label === 'string') {
    return label;
  }
  if (label && typeof label === 'object' && 'label' in label) {
    return String((label as { label: unknown }).label);
  }
  return '';
}
