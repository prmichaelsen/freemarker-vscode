<!-- @scry.entry
id: doc.freemarker-vscode-readme~dcfd33d1
kind: internal
status: active
weight: 0.7
tags:
  - "topic:freemarker-vscode"
  - "freemarker-vscode"
  - "topic:readme"
  - "readme"
  - "topic:marketplace-listing"
  - "marketplace-listing"
  - "topic:freemarker"
  - "freemarker"
  - "ftl"
  - "topic:vscode-extension"
  - "vscode-extension"
  - "kind:internal"
  - "internal"
summary: >
  Marketplace-facing README.md for the freemarker-vscode extension —
  the file VS Code Marketplace and the GitHub repo render as the
  extension's landing page. Documents what the extension actually
  ships today (syntax highlighting, snippets, LSP directive +
  builtin autocomplete, LSP hover with Reference links, semantic
  tokens, diagnostics, Go to Reference / Implementation, three
  commands), its configuration surface, install + getting-started
  flow, and pointers to CHANGELOG.md and the contribution / dev
  runbook. Strictly accurate to v0.1.6 — no aspirational features.
  Also: freemarker-vscode README, FreeMarker VS Code Marketplace
  listing, extension landing page, install instructions, features
  list, settings, configuration, getting started, prmichaelsen,
  v0.1.6, LSP autocomplete, hover, snippets, semantic tokens,
  diagnostics.
rationale: >
  The prior README.md was a dev-only runbook ("how to run the
  extension in development mode") that gave a Marketplace browser
  no information about what the extension does, what features it
  ships, how to install it, or how to configure it. The
  Marketplace renders this file as the listing page; a thin
  README understates a substantial extension and costs adoption.
applies: editing the freemarker-vscode marketplace listing, updating freemarker-vscode README, publishing a new version of the freemarker-vscode extension, describing freemarker-vscode features to users, listing what the extension contributes, documenting configuration settings
seeded_questions:
  - "What does the freemarker-vscode extension do?"
  - "What features does freemarker-vscode ship?"
  - "How do I install freemarker-vscode?"
  - "What configuration settings does freemarker-vscode expose?"
  - "freemarker-vscode README"
  - "FreeMarker VS Code marketplace listing"
  - "freemarker-vscode getting started"
  - "freemarker-vscode commands"
@scry.entry.end -->
# FreeMarker for Visual Studio Code

Language support for [Apache FreeMarker](https://freemarker.apache.org/)
templates (`.ftl`) in Visual Studio Code. Built on a client + server
Language Server Protocol architecture, with autocomplete, hover docs,
semantic highlighting, diagnostics, and reference-aware navigation
across an `.ftl` workspace.

If you write FreeMarker — for email templates, server-rendered HTML,
configuration generation, or any of the other places FreeMarker lives —
this extension gives you the IDE affordances you would expect from a
first-class language extension: directive completion when you type
`<#`, built-in completion when you type `?`, hover popups with the
canonical FreeMarker reference one click away, and navigation across
macros and assigns.

---

## Features

### Syntax highlighting

A TextMate grammar (`syntaxes/ftl.tmLanguage.xml`) colors FreeMarker
templates — directives (`<#if>`, `<#list>`, `<#macro>`, …), interpolations
(`${…}`), comments (`<#-- … -->`), and the surrounding host markup.
Files with the `.ftl` extension activate automatically; the language id
is `ftl` (aliases: `FreeMarker`, `freemarker`).

### Directive autocomplete (`<#`)

Server-side LSP completion provider, fed by a curated catalog of **33
FreeMarker directives**. Type `<#` and the full directive set surfaces
with signature, summary, and snippet-style insert text:

- Control-flow: `if`, `elseif`, `else`, `switch`, `case`, `default`,
  `break`, `continue`.
- Iteration: `list`, `items`, `sep`.
- Definitions: `assign`, `local`, `global`, `macro`, `function`,
  `return`, `nested`.
- Composition: `include`, `import`.
- Output control: `compress`, `escape`, `noescape`, `noparse`, `t`,
  `lt`, `rt`, `nt`, `flush`.
- Error handling: `attempt`, `recover`.
- Misc: `setting`, `outputformat`, `stop`, `visit`, `recurse`, `ftl`.

### Built-in function autocomplete (`?`)

Server-side LSP completion provider, fed by a curated catalog of **81
FreeMarker built-ins** — the `?name` operators applied to values:

- String: `?upper_case`, `?lower_case`, `?html`, `?trim`, `?contains`, …
- Sequence: `?size`, `?seq_contains`, `?reverse`, `?sort`, `?first`,
  `?last`, …
- Hash: `?keys`, `?values`.
- Numeric: `?round`, `?floor`, `?ceiling`, `?abs`, `?int`, `?string`.
- Boolean: `?then`, `?c`.
- Date: `?date`, `?time`, `?datetime`, `?iso_utc`, `?iso_local`, …
- Meta: `?eval`, `?interpret`, `?new`, `?has_content`, `?is_string`,
  `?is_number`, `?is_sequence`, … and the rest of the `is_*` family.

Each completion item carries a Markdown body with signature, summary,
category, and a `[Reference](url)` link to the canonical
`freemarker.apache.org` page (and, where the manual exposes it, the
exact anchor on that page).

### Hover documentation

Hovering on a directive name (`<#if`, `</#list`) or a built-in name
(`?upper_case`, `?size`) opens a Markdown popup with:

- The canonical signature.
- A one-paragraph summary from the FreeMarker reference.
- The directive / built-in category.
- A `[Reference](url)` link to the matching `freemarker.apache.org`
  page (with anchor where applicable — see CHANGELOG v0.1.6 for the
  curated anchor-overrides that handle pages where the manual shares
  anchors across builtins).

Hover and completion share the catalog source of truth, so they speak
with one voice.

### Snippets

Two snippet files contribute scaffold-style insertions:

- `snippets/ftl.json` — FreeMarker directive scaffolds (`if`, `list`,
  `macro`, `assign`, `attempt/recover`, …).
- `snippets/html.json` — common HTML snippets useful inside FTL
  templates.

### Semantic token highlighting

The client registers a semantic-tokens provider that augments the
TextMate grammar with token-classification metadata. Toggleable via the
`freemarker-vscode.semantic-tokens` setting (default on).

### Diagnostics

A client-side `FreeMarkerDiagnosticsProvider` surfaces parse-style
issues against open `.ftl` documents. Toggleable via the
`freemarker-vscode.diagnostics` setting (default on).

### Go to Implementation

Jump to a macro or function's definition inside the workspace.
Toggleable via the `freemarker-vscode.go-to-implementations` setting
(default on).

### Go to Reference

Find references to macros, assigns, and other named symbols across the
workspace. Requires the file watcher (`freemarker-vscode.watcher`).
Toggleable via the `freemarker-vscode.go-to-reference` setting
(default on).

### Commands

Three commands are contributed to the command palette:

- `FreeMarker: Add file` — `freemarker-vscode.addFile`.
- `FreeMarker: Debug parser` — `freemarker-vscode.debugParser`.
- `FreeMarker: Check for updates` — `freemarker-vscode.checkForUpdates`.

---

## Install

The extension is published to the Visual Studio Code Marketplace under
publisher **prmichaelsen**:

- From inside VS Code: open the Extensions view (`Ctrl+Shift+X` /
  `Cmd+Shift+X`), search for **FreeMarker**, and install the entry
  authored by `prmichaelsen`.
- From the CLI: `code --install-extension prmichaelsen.freemarker-vscode`.
- From GitHub: download the latest `freemarker-vscode-<version>.vsix`
  from
  [github.com/prmichaelsen/freemarker-vscode/releases](https://github.com/prmichaelsen/freemarker-vscode/releases)
  and install it via the Extensions view's `…` → `Install from VSIX…`.

VS Code `^1.75.0` is required.

---

## Getting started

1. Open any `.ftl` file (or save a new file with the `.ftl` extension).
2. Confirm the language mode in the status bar reads **FreeMarker** — the
   grammar should color directives, interpolations, and comments
   immediately.
3. Type `<#` anywhere — the directive completion list appears.
4. Type `${someValue?` — the built-in completion list appears.
5. Hover on any directive or built-in name to see its signature, summary,
   and a one-click link to the canonical FreeMarker reference page.
6. Right-click a macro or assign name to use **Go to Implementation** or
   **Go to References**.

---

## Configuration

All settings live under the `freemarker-vscode.*` namespace and can be
edited from `Settings` → `Extensions` → `FreeMarker`:

| Setting                                    | Type    | Default | Description                                                              |
|--------------------------------------------|---------|---------|--------------------------------------------------------------------------|
| `freemarker-vscode.watcher`                | boolean | `true`  | Enable the file watcher. Required for "Go to Reference" and Test Explorer. |
| `freemarker-vscode.go-to-reference`        | boolean | `true`  | Enable the "Go to Reference" feature. Requires the watcher.              |
| `freemarker-vscode.diagnostics`            | boolean | `true`  | Enable the diagnostics feature.                                          |
| `freemarker-vscode.go-to-implementations`  | boolean | `true`  | Enable the "Go to Implementation" feature.                               |
| `freemarker-vscode.semantic-tokens`        | boolean | `true`  | Enable semantic-token highlighting.                                      |
| `freemarker-vscode.telemetry`              | boolean | `false` | Enable telemetry.                                                        |

---

## Version & changelog

Current version: **0.1.6**.

The full release history — including the v0.1.0 LSP directive
autocomplete cut, the v0.1.1 server-side hover migration, the v0.1.2
Jest + Mocha test-suite shipment, the v0.1.4 `documentationUri`
enrichment that put `[Reference]` links on every hover and completion
item, and the v0.1.5 / v0.1.6 URL-audit fixes — is in
[CHANGELOG.md](./CHANGELOG.md).

---

## Contributing & development

To hack on the extension itself:

1. Run `npm install` at the project root. This installs deps in the
   root, `client/`, and `server/` workspaces (via `postinstall`).
2. Open the project folder in VS Code.
3. Press `Ctrl+Shift+B` to start tsc watch mode across the client and
   the server (see VS Code's
   [tasks docs](https://code.visualstudio.com/docs/editor/tasks#:~:text=The%20first%20entry%20executes,the%20HelloWorld.js%20file.)).
4. Switch to the Run and Debug view (`Ctrl+Shift+D`), select **Launch
   Client** from the dropdown, and press F5. VS Code spawns an
   [Extension Development Host](https://code.visualstudio.com/api/get-started/your-first-extension#:~:text=Then%2C%20inside%20the%20editor%2C%20press%20F5.%20This%20will%20compile%20and%20run%20the%20extension%20in%20a%20new%20Extension%20Development%20Host%20window.)
   with the extension loaded.
5. Inside the host window, open or create a `.ftl` file and exercise
   directive autocomplete, hover, etc.

### Tests

The extension ships two suites:

- **Unit tests (Jest)** — `npm test` or `npm run test:unit` from the
  project root. Runs `jest` inside `server/` and exercises the pure
  LSP handler surface (catalogs, completion resolver, hover resolver,
  symbol extraction) without spinning the LSP transport. Fast (~3 s).
- **Integration tests (Mocha + `@vscode/test-electron`)** — `npm run
  test:integration` from the project root. Downloads a VS Code build,
  launches it, loads the extension, opens fixture `.ftl` files under
  `integration/testFixture/`, and asserts hover popups and completion
  lists end-to-end via the VS Code API. Slow on first run; cached
  thereafter.

### Source repository

[github.com/prmichaelsen/freemarker-vscode](https://github.com/prmichaelsen/freemarker-vscode).
