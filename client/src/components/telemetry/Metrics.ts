export const Metrics = {
  User: 'User',
  VsCodeVersion: 'VsCodeVersion',
  ExtensionVersion: 'ExtensionVersion',
  GoToImplementation: 'GoToImplementation',
  GoToReference: 'GoToReference',
  ExtensionActivate: 'ExtensionActivate',
  RunTests: 'RunTests',
  // Hover.* constants were retired in v0.1.7. They were authored when hover
  // ran client-side (FreeMarkerHoverProvider with a local cache); v0.1.1
  // migrated hover to the LSP server and the cache/found/not-found events
  // ceased to have a publisher. Re-adding hover telemetry, if ever wanted,
  // belongs server-side alongside the LSP onHover handler.
  AcceptCompletion: 'AcceptCompletion',
  Fatal: 'Fatal',
  Error: 'Error',
  Dimensions: {
    Body: 'Body',
    Context: 'Context',
  },
}