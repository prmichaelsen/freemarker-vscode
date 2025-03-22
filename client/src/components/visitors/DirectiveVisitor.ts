import { DiagnosticManager } from '../managers/DiagnosticManager';
import { DocumentManagerBase } from '../managers/DocumentManagerBase';
import { directive, root, userdefined } from '../parser/grammar';
import { CloseTagElement, Element, OpenDirectiveTagElement } from '../parser/node/Element';
import { DiagnosticObjectSeverity } from "../vscode/DiagnosticObject";
import { FreeMarkerVisitor } from './FreeMarkerVisitor';
import { breadthFirst } from './Visitor';

/** Requires RangeMutator */
export class DirectiveVisitor implements FreeMarkerVisitor {
  constructor(
    private documentManager: DocumentManagerBase,
    private diagnosticManager: DiagnosticManager,
  ) {}

  traversalMode = breadthFirst;

  visit(element: Element) {
    switch (element.type) {
      case root: {
        return;
      }

      case userdefined: 
      case directive: {
        if (element.selfClosing) {
          // noop
          return;
        } else {
          if (!element.close) {
            this.diagnosticManager.push({
              type: 'token',
              severity: DiagnosticObjectSeverity.Error,
              message: `Expected matching closing tag for '${element.tag.value}'`,
              token: element.open,
            });
            return;
          }
          const { elements } = element;
          const open = elements[0] as OpenDirectiveTagElement;
          const rest = elements.slice(1, elements.length - 1);
          const close = elements[elements.length - 1] as CloseTagElement;
          switch (open.tag.value) {
            case "if": {
              const valid = ["if", "else", "elseif"];
              const match = valid.find((v) => v === close.tag.value);
              if (!match) {
                this.diagnosticManager.push({
                  type: 'token',
                  severity: DiagnosticObjectSeverity.Error,
                  message: `Expected one of 'if', 'else', 'elseif'`,
                  token: close.tag,
                });
              }
            }
            default: {
              if (open.tag.value !== close.tag.value) {
                this.diagnosticManager.push({
                  type: 'token',
                  severity: DiagnosticObjectSeverity.Error,
                  message: `Expected '${open.tag.value}'`,
                  token: close.tag,
                });
              }
            }
          }
        }
        return;
      }
    }
    return;
  }
}