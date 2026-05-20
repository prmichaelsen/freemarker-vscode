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
