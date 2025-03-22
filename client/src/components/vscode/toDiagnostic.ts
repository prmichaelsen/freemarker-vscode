import { Diagnostic, DiagnosticSeverity } from 'vscode';
import { DiagnosticObject, DiagnosticObjectSeverity } from './DiagnosticObject';
import { toRange } from './toRange';
import { DocumentManagerBase } from '../managers/DocumentManagerBase';

const severityMap = {
  [DiagnosticObjectSeverity.Error]: DiagnosticSeverity.Error,
  [DiagnosticObjectSeverity.Warning]: DiagnosticSeverity.Warning,
  [DiagnosticObjectSeverity.Information]: DiagnosticSeverity.Information,
  [DiagnosticObjectSeverity.Hint]: DiagnosticSeverity.Hint,
}

export class DiagnosticObjectConverter {
  public constructor(
    private documentManager: DocumentManagerBase
  ) {
  }

  public convert(diagnostic: DiagnosticObject) {
    const { message, severity } = diagnostic;
    switch (diagnostic.type) {
      case 'token': {
        return new Diagnostic(
          toRange(this.documentManager.getTokenRange(diagnostic.token)),
          message,
          severityMap[severity]
        );
      }
      case 'range': {
        return new Diagnostic(
          toRange(diagnostic.range),
          message,
          severityMap[severity]
        );
      }
    }
  }
}