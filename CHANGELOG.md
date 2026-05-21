#### [v0.1.7] fix: Wire VS Code Settings UI to runtime — config-namespace drift + Metrics cleanup
- Bug: `package.json` declares the six user-facing settings under `freemarker-vscode.*` (`watcher`, `go-to-reference`, `diagnostics`, `go-to-implementations`, `semantic-tokens`, `telemetry`), but `client/src/extension.ts` read them via `workspace.getConfiguration('freemarker-language-server').get(...)`. The two namespaces did not match, so toggling any of these settings in the VS Code Settings UI had no runtime effect — users could not actually disable the features they appeared to disable.
- Fix: rename the `workspace.getConfiguration(...)` namespace in `extension.ts` from `'freemarker-language-server'` to `'freemarker-vscode'`. The LSP client name (`'freemarker-language-server'`, line ~79 in `extension.ts`) is unchanged — it is the LSP transport id, not a configuration namespace, and is internal to the language-client/server handshake.
- Cleanup (same code block): removed three dead `feature` flags that had no consumer in `extension.ts` — `fileSystemProvider` (read `file-system`), `testAdapter` (read `test-explorer`), and `debugParser` (hard-coded `true`). The corresponding settings keys (`file-system`, `test-explorer`) were not declared in `package.json`, so removing them is a no-op for the user-facing surface. `registerFreeMarkerDebugParserTextDocumentContentProvider(context)` continues to run unconditionally.
- Cleanup (telemetry): removed the dead `Metrics.Hover.*` block from `client/src/components/telemetry/Metrics.ts` (`Hover.Cache.Hit`, `Hover.Cache.Miss`, `Hover.Found`, `Hover.NotFound`). These had no publisher since v0.1.1 migrated hover from the client-side `FreeMarkerHoverProvider` to the LSP server; an inline comment marks where they were and where a future server-side hover-telemetry event would belong.
- Notes for the next Marketplace publish: this is a client-side bug fix and dead-code removal. No server logic, no catalog change, no test surface change. Once the shared `agent/secrets/vscode-marketplace.pat` lands and `vsce publish` runs, the six settings begin behaving as documented in the v0.1.6 README (which already described the `freemarker-vscode.*` namespace correctly).
- Out of scope (logged as side finds for a future wake): `package.json` declares two commands — `freemarker-vscode.addFile` and `freemarker-vscode.checkForUpdates` — that have no `registerCommand(...)` site in `client/src/`. Either the registrations are missing or the declarations are stale; resolving this is a follow-on wake.

#### [v0.1.6] fix: Resolve builtin `documentationUri` anchor drift — `BUILTIN_URL_OVERRIDES` map
- Per-anchor audit against the live FreeMarker manual surfaced ~24 builtin records whose `#ref_builtin_<name>` fragment didn't match any `id="…"` on the parent page. Users following these `[Reference](url)` links from hover/completion landed on the right page but the browser didn't scroll to the named subsection. v0.1.6 fixes every drift case via a new `BUILTIN_URL_OVERRIDES` map consulted before the category-default URL builder.
- Cross-page (now route to `ref_builtins_expert.html`): `eval`, `interpret`, `new`, `has_content`, and the eight `is_*` builtins (`is_string`/`is_number`/`is_boolean`/`is_date`/`is_sequence`/`is_hash`/`is_macro`/`is_directive`). The eight `is_*` builtins share the manual's `#ref_builtin_isType` anchor.
- Shared anchor on the category page: `min`/`max` → `#ref_builtin_min_max`; `round`/`floor`/`ceiling`/`int` → `#ref_builtin_rounding`; `string` (numeric) → `#ref_builtin_string_for_number`; `date`/`time`/`datetime` → `#ref_builtin_date_datetype`; `iso_utc`/`iso_local` → `#ref_builtin_date_iso`.
- No per-name anchor (link to page only): `default` and `exists` are deprecated builtins the manual exposes only as page content; v0.1.6 emits a page-level URL without fragment for these. The `BuiltinRecord.documentationUri` regex in `builtins.test.ts` is relaxed accordingly (fragment is now optional and may contain mixed case for the `isType` form).
- Post-fix audit: all 86 unique catalog URLs return 200 (29 pages); all 65 URLs that carry a fragment land on a verified `id="…"` on the parent page. Method documented in [agent/runtime/tracks/freemarker-worker/reports/2026-05-21T10-00-09Z-wake-v0-1-5-url-audit.md](/agent/runtime/tracks/freemarker-worker/reports/2026-05-21T10-00-09Z-wake-v0-1-5-url-audit.md) §"Audit method" and extended to per-anchor verification in the v0.1.6 wake report.
- The previous `new`-builtin special case in `builtinDocumentationUri` is folded into `BUILTIN_URL_OVERRIDES` for consistency. The exported `BUILTIN_URL_OVERRIDES` constant is the single curated source of drift cases; future drift surfaces as one map entry plus one test row.
- Tests: regex relaxed in the per-record shape test, prior `documentationUri maps category → page` test trimmed to non-overridden builtins, three new tests (`documentationUri honors BUILTIN_URL_OVERRIDES for known drift cases` covering 21 specific URL assertions, `every BUILTIN_URL_OVERRIDES key names a catalog builtin` as a typo-guard, and `every catalog builtin produces the URL its category + override imply` as a builder-record invariant). 30 jest tests (up from 27); tsc clean.

#### [v0.1.5] fix: Repair four 404 `documentationUri` values — `break`, `continue`, `nested`, `return`
- HEAD-check audit of the 33 unique reference pages introduced in v0.1.4 surfaced four 404s. The FreeMarker manual documents these four directives on sibling pages rather than their own pages.
- `break`, `continue` → `ref_directive_list.html` (loop-control is documented inside `<#list>`'s reference page).
- `nested` → `ref_directive_macro.html` (the page h1 reads `macro, nested, return`; `<#nested>` has no dedicated page).
- `return` → `ref_directive_function.html` (the page h1 reads `function, return`; `<#return>` is documented under `<#function>`).
- Sibling-URL invariants added to the existing `directives.test.ts` sibling-share `test()` block for all four mappings (jest test count stays at 27 — the assertions land inside the existing per-block test); tsc clean.
- Catalog header doc comment updated to enumerate the new sibling-share rules alongside the existing four families (`elseif`/`else`, `case`/`default`, `recover`, `t`/`lt`/`rt`/`nt`).
- No behavior change for hover/completion plumbing — only catalog data fixed. Users on v0.1.4 see `[Reference](url)` links that 404; v0.1.5 fixes those four to the canonical sibling pages.
- Out of scope for v0.1.5 (known limitation): per-anchor verification across the 105 builtin `#ref_builtin_<name>` fragments. An audit during the v0.1.5 cycle confirmed that all 29 parent pages return 200, but several builtin anchors don't match the FreeMarker manual's actual scheme (e.g. `round`/`floor`/`ceiling` collapse under `#ref_builtin_rounding`; `date`/`time`/`datetime`/`iso_utc`/`iso_local` use `ref_builtin_date_*` suffixed forms; `eval`/`interpret`/`is_*`/`has_content`/`default`/`exists` are documented on `ref_builtins_expert.html` rather than their category pages). Users following these links land on the correct page but not the correct subsection. Remediation is a follow-on wake — either per-builtin anchor mapping or fragment-drop with page-only links.

#### [v0.1.4] feat: Catalog `documentationUri` + hover/completion Reference link
- Both `DirectiveRecord` and `BuiltinRecord` gain a required `documentationUri` field carrying the canonical `freemarker.apache.org/docs/ref_directive_*.html` / `ref_builtins_*.html#ref_builtin_*` URL for each entry.
- All 33 directive records and all 81 builtin records populated. Siblings (`elseif`/`else` → `ref_directive_if.html`; `case`/`default` → `ref_directive_switch.html`; `recover` → `ref_directive_attempt.html`; `t`/`lt`/`rt`/`nt` → `ref_directive_t.html`) share their parent's reference page.
- Builtin URLs derived via `builtinDocumentationUri(name, category)` — exported so tests can assert the shape without hand-typing 81 absolute URLs. `numeric` → `number` page slug; `meta` → `type_independent` page slug; `new` overrides to the `expert` page.
- `catalogHoverMarkdown(signature, summary, category, documentationUri)` now appends `\n\n[Reference](<uri>)` to the hover Markdown. Both directive and builtin completion items append the same line to their `documentation` Markdown — completion + hover continue to speak with one voice.
- Tests: per-record `documentationUri` shape regex on both catalogs, sibling-URL invariants for directives, `builtinDocumentationUri` category-slug mapping, `[Reference](uri)` substring assertions in `resolveHover` for directive + builtin paths, exact-Markdown assertion in `catalogHoverMarkdown`. 27 jest tests (up from 25), all green; tsc clean.

#### [v0.1.3] test: Expanded .ftl test fixtures + broadened hover/completion coverage
- New fixtures under `integration/testFixture/`: `hover/directives.ftl` (covers ~22 directives end-to-end), `hover/builtins.ftl` (covers ~52 builtins across string/sequence/hash/numeric/date/meta categories), `hover/nested.ftl` (macro→if→list nesting, attempt/recover around list/continue), `hover/email-template.ftl` (realistic HTML+FTL email template), `hover/mixed-html.ftl` (FTL interleaved with HTML markup), `completion/directive-contexts.ftl` (flush-left + indented `<#` trigger sites), `completion/builtin-contexts.ftl` (string/sequence/hash operand `?` trigger sites), `diagnostics/malformed.ftl` (parked for Phase 2 diagnostics).
- `integration/src/test/hover.test.ts` rewritten to a table-driven shape — one mocha `test()` per directive and per builtin via a position-resolver helper (`findPos` in `helper.ts`). Coverage jumps from 2 hover assertions to ~94.
- `integration/src/test/completion.test.ts` expanded to assert directive completion fires at flush-left and indented `<#` sites, and builtin completion fires at multiple `${operand?` sites — also asserts the catalog-breadth labels are present.
- `helper.ts` activate now memoizes the extension-activation sleep — subsequent fixture opens skip the 2s wait, keeping the suite runtime tractable as the test table grows.
- Test count: 7 mocha tests → ~106 (94 hover + 9 completion + 3 diagnostics). Fixture file count: 5 → 13.
- Jest unit tests unchanged (25, all green).

#### [v0.1.2] test: Jest catalog unit tests + Mocha electron integration tests
- Extracted pure LSP handler logic from `server/src/server.ts` into `server/src/handlers.ts` (`precedingContext`, `directiveCompletionItem`, `builtinCompletionItem`, `directiveCompletions`, `builtinCompletions`, `resolveCompletion`, `symbolAtCursor`, `catalogHoverMarkdown`, `resolveHover`). `server.ts` is now thin connection wiring; the handler surface is unit-testable without spinning the LSP transport.
- Jest unit tests under `server/src/`: `catalog/directives.test.ts` (shape, no-duplicate-names, Phase 1 coverage, count guard = 33), `catalog/builtins.test.ts` (shape, no-duplicate-names, high-frequency builtin coverage, count guard = 81), `handlers.test.ts` (`symbolAtCursor` word/trigger/precedingTwo extraction, `catalogHoverMarkdown` layout, `resolveHover` directive + builtin paths, `resolveCompletion` directive + builtin paths). 25 tests across 3 suites, all green.
- Mocha electron integration tests under `integration/src/test/`: `hover.test.ts` (directive + builtin hover via `vscode.executeHoverProvider` against `testFixture/hover/hover-sample.ftl`) and `completion.test.ts` (directive + builtin completion via `vscode.executeCompletionItemProvider` against `testFixture/completion/completion-sample.ftl`).
- Deduped the `eval` builtin (previously listed under both `string` and `meta`). `BUILTINS.length` is now 81; the test guard moves accordingly.
- `npm test` / `npm run test:unit` (root) runs Jest unit tests; `npm run test:integration` runs the Mocha electron suite (downloads VS Code on first run).

#### [v0.1.1] feat: Server-side catalog-fed hover + built-in `?` autocomplete
- Hover is now an LSP server capability (`hoverProvider: true`) driven by the shared `DIRECTIVES` and `BUILTINS` catalogs. Directive context (`<#name` / `</#name`) and built-in context (`?name`) both resolve to the same Markdown body completion items carry — one signature/summary surface across the LSP boundary.
- Retired the client-side `FreeMarkerHoverProvider` (242 LOC) in favor of the server handler (~120 LOC including catalog lookup helpers); the `freemarker-vscode.hover` config setting is removed (hover is unconditional at the LSP layer, mirroring how completion was handled in v0.1.0).
- `onCompletion` gains a second branch handling the `?` trigger — scans back to the nearest `?` on the current line and returns the `BUILTINS` catalog (82 entries) as `CompletionItem`s.

#### [v0.1.0] feat: LSP directive autocomplete + FreeMarker reference catalog
- Server-side `completionProvider` capability with `<#` and `?` trigger characters.
- Directive autocomplete: 33 entries from the closed Phase 1 set (`if`, `list`, `assign`, `macro`, `function`, …) with signatures, summaries, and snippet-style insert text.
- New shared catalogs under `server/src/catalog/` (`directives.ts`, `builtins.ts`); built-in autocomplete + catalog-fed hover land in a follow-up release.
- Retired the dead client `completionProvider` feature flag — completion is now authoritatively server-side under LSP.

#### [v0.0.4] feat: Hover provider
-

#### [v0.0.3] feat: Handle local as self-closing or open-closing
-

#### [v0.0.2] bugf: Some self closing tags do not need />
-

#### [v0.0.1] bugf: Self closing directives
-

#### [v0.0.0] feat: FreeMarker VS Code
Initial commit
