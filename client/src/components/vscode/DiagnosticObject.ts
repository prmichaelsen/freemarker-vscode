import { Token } from '../parser/Token';
import { RangeObject, compareRange } from './RangeObject';

export enum DiagnosticObjectSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3
}

interface DiagnosticObjectRange {
  type: 'range';
  range: RangeObject;
  message: string;
  severity: DiagnosticObjectSeverity;
}

interface DiagnosticObjectToken {
  type: 'token';
  token: Token;
  message: string;
  severity: DiagnosticObjectSeverity;
}

export type DiagnosticObject = DiagnosticObjectRange | DiagnosticObjectToken;

export const isDiagnosticPresent = (diagnostic: DiagnosticObject, diagnostics: DiagnosticObject[]): boolean => {
  switch (diagnostic.type) {
    case 'token':
      return diagnostics.some(d => 
          d.type === 'token' && d.token === diagnostic.token
          && d.message === diagnostic.message
      );
    case 'range':
      return diagnostics.some(
        d => d.type === 'range' && compareRange(d.range, diagnostic.range) === 1
        && d.message === diagnostic.message
      );
  }
}

/** push diagnostic only if it does not duplicate a message at the same location  */
export const pushDiagnostic = (diagnostic: DiagnosticObject, diagnostics: DiagnosticObject[]): void => {
  if (!isDiagnosticPresent(diagnostic, diagnostics)) {
    diagnostics.push(diagnostic);
  }
};