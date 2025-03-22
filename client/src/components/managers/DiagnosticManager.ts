import { DiagnosticObject } from '../vscode/DiagnosticObject';

/**
 * An abstraction that collects diagnostics.
 * Combine this with a visitor that is expected to
 * report diagnostics.
 */
export class DiagnosticManager {
  constructor(
    private readonly diagnostics: DiagnosticObject[] = []
  ) {}

  public push(...diagnostics: DiagnosticObject[]) {
    this.diagnostics.push(...diagnostics);
  }

  public values(): DiagnosticObject[] {
    return this.diagnostics;
  }
}