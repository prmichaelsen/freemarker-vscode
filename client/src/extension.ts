/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { DocumentFilter, ExtensionContext, languages, Uri, workspace } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';
import { registerTelemetryAcceptCompletionCommand } from './commands/registerAcceptCompletionCommand';
import { registerDebugParserCommand } from './commands/registerDebugParserCommand';
import { Metrics } from './components/telemetry/Metrics';
import { Telemetry } from './components/telemetry/Telemetry';
import { registerWatcher } from './lib/vscode/Watcher';
import { FreeMarkerDiagnosticsProvider } from './providers/FreeMarkerDiagnosticsProvider';
import { FreeMarkerImplementationProvider } from './providers/FreeMarkerImplementationProvider';
import { FreeMarkerReferenceProvider } from './providers/FreeMarkerReferenceProvider';
import { FreeMarkerSemanticTokensProvider, legend } from './providers/FreeMarkerSemanticTokensProvider';
import { registerFreeMarkerDebugParserTextDocumentContentProvider } from './providers/registerFreeMarkerDebugParserTextDocumentContentProvider';

const documentFilters: DocumentFilter[] = [
  { language: 'freemarker' },
  { language: 'ftl' },
];
let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // Config namespace MUST match package.json's `contributes.configuration.properties`
  // keys — the user-facing VS Code Settings UI is wired to those keys. v0.1.7
  // fixes a drift where the runtime read from `freemarker-language-server.*`
  // while package.json declared `freemarker-vscode.*`, so toggles in the UI
  // had no runtime effect.
  const config = workspace.getConfiguration('freemarker-vscode');
  const feature = {
    watcher: config.get('watcher', true) as boolean,
    referenceProvider: config.get('go-to-reference', true) as boolean,
    diagnosticsProvider: config.get('diagnostics', true) as boolean,
    implementationProvider: config.get('go-to-implementations', true) as boolean,
    semanticTokensProvider: config.get('semantic-tokens', true) as boolean,
    // Hover is now an LSP server capability (see server/src/server.ts);
    // the client flag is retired and the server is the source of truth.
    // Completion was retired client-side in v0.1.0 for the same reason.
    telemetry: config.get('telemetry', false) as boolean,
  };

  Telemetry.enabled = feature.telemetry;
  Telemetry.publish([{
    MetricName: Metrics.ExtensionActivate,
    Unit: 'Count',
    Value: 1,
  }]);

  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join('server', 'out', 'server.js')
  );

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'ftl' },
    ],
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'freemarker-language-server',
    'FreeMarker Language Server',
    serverOptions,
    clientOptions
  );

  const freemarkerDiagnosticsProvider = new FreeMarkerDiagnosticsProvider();
  const diagnosticsCollection = languages.createDiagnosticCollection("FreeMarker");
  client.onRequest('freemarker/diagnostics', async ({ uri }) => {
    if (!feature.diagnosticsProvider) {
      return;
    }
    try {
      const diagnostics = await freemarkerDiagnosticsProvider.provideDiagnostics(uri);
      diagnosticsCollection.set(Uri.parse(uri), diagnostics);
    } catch (e) {
      console.log(e);
    }
  })

  // Start the client. This will also launch the server
  client.start();


  if (feature.watcher) {
    registerWatcher(context);
  }

  // Language Providers
  if (feature.implementationProvider) {
    context.subscriptions.push(languages.registerImplementationProvider(
      documentFilters, new FreeMarkerImplementationProvider())
    );
  }
  if (feature.semanticTokensProvider) {
    context.subscriptions.push(languages.registerDocumentSemanticTokensProvider(
      documentFilters, new FreeMarkerSemanticTokensProvider(), legend,
    ));
  }
  if (feature.referenceProvider) {
    context.subscriptions.push(languages.registerReferenceProvider(
      documentFilters, new FreeMarkerReferenceProvider()
    ));
  }

  registerFreeMarkerDebugParserTextDocumentContentProvider(context);

  registerDebugParserCommand(context);
  registerTelemetryAcceptCompletionCommand(context);
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
