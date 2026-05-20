# FreeMarker VS Code

Language support for FreeMarker

## Running the extension in development mode

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to start compiling the client and server in [watch mode](https://code.visualstudio.com/docs/editor/tasks#:~:text=The%20first%20entry%20executes,the%20HelloWorld.js%20file.).
- Switch to the Run and Debug View in the Sidebar (Ctrl+Shift+D).
- Select `Launch Client` from the drop down (if it is not already).
- Press ▷ to run the launch config (F5).
- In the [Extension Development Host](https://code.visualstudio.com/api/get-started/your-first-extension#:~:text=Then%2C%20inside%20the%20editor%2C%20press%20F5.%20This%20will%20compile%20and%20run%20the%20extension%20in%20a%20new%20Extension%20Development%20Host%20window.) instance of VSCode, open a document in 'plain text' language mode.
  - Type `j` or `t` to see `Javascript` and `TypeScript` completion.
  - Enter text content such as `AAA aaa BBB`. The extension will emit diagnostics for all words in all-uppercase.

## Testing

The extension ships two test suites:

- **Unit tests (Jest)** — `npm test` or `npm run test:unit` from the
  project root. Runs `jest` inside `server/` and exercises the pure
  LSP handler surface (catalogs, completion resolver, hover resolver,
  symbol extraction) without spinning the LSP transport. Fast (~3 s).
- **Integration tests (Mocha + `@vscode/test-electron`)** — `npm run
  test:integration` from the project root. Downloads a VS Code build,
  launches it, loads the extension, opens fixture `.ftl` files under
  `integration/testFixture/`, and asserts hover popups and completion
  lists end-to-end via the VS Code API. Slow first run (downloads
  VS Code); cached on subsequent runs.

Both suites are green on `mainline`. See
[`CHANGELOG.md`](./CHANGELOG.md) for the per-release coverage delta.
