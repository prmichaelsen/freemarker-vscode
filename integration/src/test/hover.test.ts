/* @scry.entry
 * id: code.freemarker-hover-integration-test~b318a6f4
 * kind: code
 * status: active
 * weight: 0.6
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:hover", "hover", "topic:integration-test", "integration-test", "mocha", "freemarker-vscode"]
 * summary: >
 *   Mocha electron integration test for the freemarker-vscode hover
 *   surface. Opens fixture .ftl files inside a real VS Code instance
 *   and asserts that hovering on directive and builtin names returns
 *   hover popups whose Markdown contents include the catalog summary.
 *   Exercises the LSP boundary end-to-end (server.onHover → client →
 *   vscode.executeHoverProvider). Covers the breadth of the directive
 *   + builtin catalogs (~20 directives, ~30 builtins) plus nested /
 *   real-world fixtures. Also: hover integration test,
 *   executeHoverProvider, directive hover, builtin hover, mocha
 *   vscode test, table-driven assertions.
 * rationale: Without an end-to-end test, a wiring regression between server.onHover and the LSP transport ships silently — jest helper tests don't exercise the protocol.
 * applies: editing server hover wiring, adding new hover-providing capabilities, debugging hover-popup regressions
 * seeded_questions:
 *   - "How is freemarker-vscode hover end-to-end tested?"
 *   - "Where is the directive hover mocha test?"
 *   - "executeHoverProvider freemarker"
 *   - "freemarker hover catalog coverage"
 * @scry.entry.end
 */

import * as vscode from 'vscode';
import * as assert from 'assert';
import * as fs from 'fs';
import { activate, getDocPath, getDocUri, findPos } from './helper';

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

async function assertHover(
  docUri: vscode.Uri,
  text: string,
  lineNo: number,
  needle: string,
  expectSubstring: string,
) {
  const pos = findPos(text, lineNo, needle);
  const hovers = await vscode.commands.executeCommand<vscode.Hover[]>(
    'vscode.executeHoverProvider',
    docUri,
    pos,
  );
  assert.ok(
    hovers && hovers.length > 0,
    `expected a hover for '${needle}' on line ${lineNo}`,
  );
  const rendered = renderHover(hovers!);
  assert.ok(
    rendered.includes(expectSubstring),
    `hover for '${needle}' (line ${lineNo}) missing '${expectSubstring}':\n${rendered}`,
  );
}

suite('hover — baseline (hover-sample.ftl)', () => {
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

// Each row is [lineSearchText, expectedSummarySubstring]. The line
// number is resolved by the order entries appear in the fixture file
// (one entry per matching line, top-to-bottom).
const DIRECTIVE_ROWS: ReadonlyArray<readonly [needle: string, expect: string]> = [
  ['assign', 'Create or update a variable'],
  ['local', 'macro/function local scope'],
  ['global', 'global'],
  ['list', 'Iterate over a sequence'],
  ['continue', 'next iteration'],
  ['macro', 'Define a reusable user-directive'],
  ['nested', 'nested content'],
  ['function', 'callable expression-context function'],
  ['return', 'enclosing <#function> or <#macro>'],
  ['if', 'Conditionally include content'],
  ['elseif', 'Additional branch'],
  ['else', 'Fallback branch'],
  ['switch', 'Dispatch on a value'],
  ['case', 'Arm of an enclosing <#switch>'],
  ['break', 'Exit the nearest'],
  ['default', 'Fallback arm'],
  ['attempt', 'Try a body'],
  ['recover', 'Recovery arm'],
  ['import', 'Load another template'],
  ['include', 'Inline another template'],
  ['escape', 'Wrap every interpolation'],
  ['noescape', 'Disable a surrounding'],
  ['compress', 'Collapse runs of whitespace'],
  ['noparse', 'verbatim'],
  ['outputformat', 'auto-escaping output format'],
  ['noautoesc', 'Disable auto-escaping'],
  ['setting', 'Override a FreeMarker engine setting'],
  ['stop', 'Halt template processing'],
  ['ftl', 'Per-template header'],
];

suite('hover — directive coverage (directives.ftl)', () => {
  let text: string;
  let docUri: vscode.Uri;

  suiteSetup(async () => {
    docUri = getDocUri('hover/directives.ftl');
    text = fs.readFileSync(getDocPath('hover/directives.ftl'), 'utf-8');
    await activate(docUri);
  });

  // Find the first line where `<#NAME>` or `</#NAME>` appears with
  // NAME matching exactly. The regex `[A-Za-z]+` is greedy so
  // `<#elseif>` resolves to `elseif`, not `else`, and `<#noescape>`
  // to `noescape`, not `escape`.
  function findDirectiveLine(name: string): number {
    const lines = fs.readFileSync(getDocPath('hover/directives.ftl'), 'utf-8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/<\/?#([A-Za-z]+)/);
      if (m && m[1] === name) return i;
    }
    throw new Error(`directive '${name}' not found in fixture`);
  }

  for (const [needle, expect] of DIRECTIVE_ROWS) {
    test(`hover on <#${needle}>`, async () => {
      const lineNo = findDirectiveLine(needle);
      await assertHover(docUri, text, lineNo, needle, expect);
    });
  }
});

// Builtin rows — one per builtin entry in builtins.ftl, top-to-bottom.
const BUILTIN_ROWS: ReadonlyArray<readonly [needle: string, expect: string]> = [
  ['upper_case', 'Convert the operand string to upper case'],
  ['lower_case', 'Convert the operand string to lower case'],
  ['cap_first', 'Capitalize the first letter of the operand string'],
  ['uncap_first', 'Lower-case the first letter'],
  ['capitalize', 'Capitalize the first letter of each word'],
  ['trim', 'Remove leading and trailing whitespace'],
  ['length', 'Number of characters'],
  ['index_of', 'first occurrence'],
  ['last_index_of', 'last occurrence'],
  ['contains', 'True if the operand string contains'],
  ['starts_with', 'starts with a prefix'],
  ['ends_with', 'ends with a suffix'],
  ['replace', 'Replace all occurrences'],
  ['matches', 'regular expression'],
  ['split', 'Split the operand string'],
  ['substring', 'Extract a substring'],
  ['left_pad', 'Pad the operand string on the left'],
  ['right_pad', 'Pad the operand string on the right'],
  ['word_list', 'Split the operand string on whitespace'],
  ['html', 'Escape HTML-significant'],
  ['xhtml', 'Escape XHTML-significant'],
  ['xml', 'Escape XML-significant'],
  ['js_string', 'JavaScript string literal'],
  ['json_string', 'JSON string literal'],
  ['url', 'URL-encode the operand string'],
  ['url_path', 'URL path segment'],
  ['number', 'Parse the operand string as a number'],
  ['boolean', 'Parse the operand string as a boolean'],
  ['size', 'Number of items'],
  ['first', 'First item'],
  ['last', 'Last item'],
  ['reverse', 'reverse order'],
  ['sort', 'natural ordering'],
  ['sort_by', 'sorted by a hash key'],
  ['seq_contains', 'True if the operand sequence contains'],
  ['seq_index_of', 'Index of the first occurrence'],
  ['seq_last_index_of', 'Index of the last occurrence'],
  ['join', 'Concatenate the operand sequence'],
  ['keys', 'Sequence of keys'],
  ['values', 'Sequence of values'],
  ['abs', 'Absolute value'],
  ['round', 'Round the operand number'],
  ['floor', 'Largest integer'],
  ['ceiling', 'Smallest integer'],
  ['date', 'date-only value'],
  ['time', 'time-only value'],
  ['datetime', 'date-and-time value'],
  ['iso_utc', 'ISO 8601'],
  ['is_string', 'True if the operand is a string'],
  ['has_content', 'non-null and non-empty'],
  ['default', 'fallback'],
  ['exists', 'True if the operand is defined'],
];

suite('hover — builtin coverage (builtins.ftl)', () => {
  let text: string;
  let docUri: vscode.Uri;

  suiteSetup(async () => {
    docUri = getDocUri('hover/builtins.ftl');
    text = fs.readFileSync(getDocPath('hover/builtins.ftl'), 'utf-8');
    await activate(docUri);
  });

  // Each builtin appears once in the fixture, in the table order
  // above. We scan top-to-bottom and bind first-occurrence lines.
  const lineByName = new Map<string, number>();
  function resolveLines() {
    if (lineByName.size > 0) return;
    const lines = fs.readFileSync(getDocPath('hover/builtins.ftl'), 'utf-8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/\?([A-Za-z_]+)/);
      if (m && !lineByName.has(m[1])) {
        lineByName.set(m[1], i);
      }
    }
  }

  for (const [needle, expect] of BUILTIN_ROWS) {
    test(`hover on ?${needle}`, async () => {
      resolveLines();
      const lineNo = lineByName.get(needle);
      assert.ok(
        lineNo !== undefined,
        `builtin '${needle}' not found in builtins.ftl`,
      );
      await assertHover(docUri, text, lineNo!, needle, expect);
    });
  }
});

suite('hover — nested (nested.ftl)', () => {
  test('hover on macro inside outer scope', async () => {
    const docUri = getDocUri('hover/nested.ftl');
    const text = fs.readFileSync(getDocPath('hover/nested.ftl'), 'utf-8');
    await activate(docUri);
    // line 1: `<#macro renderUsers users title>`
    await assertHover(docUri, text, 1, 'macro', 'Define a reusable user-directive');
  });

  test('hover on list nested inside if nested inside macro', async () => {
    const docUri = getDocUri('hover/nested.ftl');
    const text = fs.readFileSync(getDocPath('hover/nested.ftl'), 'utf-8');
    await activate(docUri);
    // `<#list users as u>` is on line 5 (0-indexed)
    await assertHover(docUri, text, 5, 'list', 'Iterate over a sequence');
  });

  test('hover on ?has_content inside nested if', async () => {
    const docUri = getDocUri('hover/nested.ftl');
    const text = fs.readFileSync(getDocPath('hover/nested.ftl'), 'utf-8');
    await activate(docUri);
    await assertHover(docUri, text, 3, 'has_content', 'non-null and non-empty');
  });

  test('hover on attempt directive in nested error-handling block', async () => {
    const docUri = getDocUri('hover/nested.ftl');
    const text = fs.readFileSync(getDocPath('hover/nested.ftl'), 'utf-8');
    await activate(docUri);
    // line 15: `<#attempt>`
    await assertHover(docUri, text, 15, 'attempt', 'Try a body');
  });
});

suite('hover — realistic email-template (email-template.ftl)', () => {
  test('hover on <#if> in real template', async () => {
    const docUri = getDocUri('hover/email-template.ftl');
    const text = fs.readFileSync(getDocPath('hover/email-template.ftl'), 'utf-8');
    await activate(docUri);
    await assertHover(docUri, text, 11, 'if', 'Conditionally include content');
  });

  test('hover on <#list> in real template', async () => {
    const docUri = getDocUri('hover/email-template.ftl');
    const text = fs.readFileSync(getDocPath('hover/email-template.ftl'), 'utf-8');
    await activate(docUri);
    await assertHover(docUri, text, 18, 'list', 'Iterate over a sequence');
  });

  test('hover on ?html escaping in real template', async () => {
    const docUri = getDocUri('hover/email-template.ftl');
    const text = fs.readFileSync(getDocPath('hover/email-template.ftl'), 'utf-8');
    await activate(docUri);
    // line 6: `<title>${subject?html}</title>`
    await assertHover(docUri, text, 6, 'html', 'Escape HTML-significant');
  });

  test('hover on ?cap_first in real template', async () => {
    const docUri = getDocUri('hover/email-template.ftl');
    const text = fs.readFileSync(getDocPath('hover/email-template.ftl'), 'utf-8');
    await activate(docUri);
    await assertHover(docUri, text, 9, 'cap_first', 'Capitalize the first letter');
  });
});

suite('hover — mixed FTL + HTML (mixed-html.ftl)', () => {
  test('hover on ?upper_case inside HTML attribute neighborhood', async () => {
    const docUri = getDocUri('hover/mixed-html.ftl');
    const text = fs.readFileSync(getDocPath('hover/mixed-html.ftl'), 'utf-8');
    await activate(docUri);
    await assertHover(docUri, text, 3, 'upper_case', 'Convert the operand string to upper case');
  });

  test('hover on <#list> inside HTML body', async () => {
    const docUri = getDocUri('hover/mixed-html.ftl');
    const text = fs.readFileSync(getDocPath('hover/mixed-html.ftl'), 'utf-8');
    await activate(docUri);
    // Line 9: `    <#list tags as tag>`
    await assertHover(docUri, text, 9, 'list', 'Iterate over a sequence');
  });

  test('hover on ?lower_case in tag iteration', async () => {
    const docUri = getDocUri('hover/mixed-html.ftl');
    const text = fs.readFileSync(getDocPath('hover/mixed-html.ftl'), 'utf-8');
    await activate(docUri);
    // Line 10: `      <li class="tag">#${tag?lower_case}</li>`
    await assertHover(docUri, text, 10, 'lower_case', 'Convert the operand string to lower case');
  });
});
