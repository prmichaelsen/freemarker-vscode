/* @scry.entry
 * id: code.freemarker-hover-integration-test~b318a6f4
 * kind: code
 * status: active
 * weight: 0.6
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:hover", "hover", "topic:integration-test", "integration-test", "mocha", "freemarker-vscode"]
 * summary: >
 *   Mocha electron integration test for the freemarker-vscode hover
 *   surface. Opens a fixture .ftl file inside a real VS Code instance
 *   and asserts that hovering a directive name (`<#if>`) and a
 *   builtin name (`?upper_case`) returns hover popups whose Markdown
 *   contents include the catalog summary. Exercises the LSP boundary
 *   end-to-end (server.onHover → client → vscode.executeHoverProvider).
 *   Also: hover integration test, executeHoverProvider, directive
 *   hover, builtin hover, mocha vscode test.
 * rationale: Without an end-to-end test, a wiring regression between server.onHover and the LSP transport ships silently — jest helper tests don't exercise the protocol.
 * applies: editing server hover wiring, adding new hover-providing capabilities, debugging hover-popup regressions
 * seeded_questions:
 *   - "How is freemarker-vscode hover end-to-end tested?"
 *   - "Where is the directive hover mocha test?"
 *   - "executeHoverProvider freemarker"
 * @scry.entry.end
 */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { activate, getDocUri } from './helper';

suite('hover', () => {
  test('directive hover surfaces catalog summary', async () => {
    const docUri = getDocUri('hover/hover-sample.ftl');
    await activate(docUri);

    // `<#if user.active>` — `if` spans columns 2-4 on line 0.
    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider',
      docUri,
      new vscode.Position(0, 3),
    );

    assert.ok(hovers && hovers.length > 0, 'expected a hover for <#if>');
    const text = renderHover(hovers!);
    assert.ok(
      text.includes('Conditionally include content'),
      `expected directive summary in hover, got:\n${text}`,
    );
  });

  test('builtin hover surfaces catalog summary', async () => {
    const docUri = getDocUri('hover/hover-sample.ftl');
    await activate(docUri);

    // `${user.name?upper_case}` on line 1 — `upper_case` starts at
    // column 18; hover anywhere inside it.
    const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
      'vscode.executeHoverProvider',
      docUri,
      new vscode.Position(1, 22),
    );

    assert.ok(hovers && hovers.length > 0, 'expected a hover for ?upper_case');
    const text = renderHover(hovers!);
    assert.ok(
      text.includes('Convert the operand string to upper case'),
      `expected builtin summary in hover, got:\n${text}`,
    );
  });
});

function renderHover(hovers: vscode.Hover[]): string {
  const out: string[] = [];
  for (const hover of hovers) {
    for (const c of hover.contents) {
      if (typeof c === 'string') {
        out.push(c);
      } else if ('value' in c) {
        out.push(c.value);
      }
    }
  }
  return out.join('\n');
}
