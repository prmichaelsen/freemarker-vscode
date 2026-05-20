/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionList,
  CompletionParams,
  Hover,
  HoverParams,
  TextDocumentSyncKind,
  InitializeResult,
  DocumentDiagnosticReportKind,
  type DocumentDiagnosticReport,
} from 'vscode-languageserver/node';

import {
  TextDocument,
} from 'vscode-languageserver-textdocument';

import { resolveCompletion, resolveHover } from './handlers';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// https://github.com/microsoft/vscode-languageserver-node/blob/main/client-node-tests/src/servers/testServer.ts
// https://vshaxe.github.io/vscode-extern/vscode
connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      diagnosticProvider: {
        interFileDependencies: false,
        workspaceDiagnostics: false,
      },
      // Phase 1: directive + builtin completion (trigger chars `#`,
      // `?`); catalog-fed hover.
      completionProvider: {
        triggerCharacters: ['#', '?'],
        resolveProvider: false,
      },
      hoverProvider: true,
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});


connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(DidChangeConfigurationNotification.type, undefined);
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

connection.onDidChangeConfiguration(change => {
  connection.languages.diagnostics.refresh();
});

// Only keep settings for open documents
documents.onDidClose(e => {
});

connection.languages.diagnostics.on(async (params) => {
  documents.get(params.textDocument.uri);
  try {
    connection.sendRequest('freemarker/diagnostics', {
      uri: params.textDocument.uri,
    });
  } catch (e) {
    console.log(e);
  }
  return {
    kind: DocumentDiagnosticReportKind.Full,
    items: [],
  } satisfies DocumentDiagnosticReport;
});


// ---------------------------------------------------------------------------
// Completion + Hover wiring (pure logic lives in ./handlers)
// ---------------------------------------------------------------------------

connection.onCompletion((params: CompletionParams): CompletionList | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    return null;
  }
  return resolveCompletion(doc, params);
});

connection.onHover((params: HoverParams): Hover | null => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    return null;
  }
  return resolveHover(doc, params);
});


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
