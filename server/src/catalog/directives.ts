/* @scry.entry
 * id: code.freemarker-directives-catalog~a395b9c7
 * kind: pattern
 * status: active
 * weight: 0.7
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:catalog", "catalog", "freemarker-vscode", "directives"]
 * summary: >
 *   Closed-set catalog of FreeMarker directives shipped with
 *   freemarker-vscode. 32 entries, the Phase 1 directive set named in
 *   design.freemarker-worker-enhancement~9d689704 §4. Each record
 *   carries name, signature (canonical FTL form), summary, category.
 *   Feeds the server's onCompletion handler and (next-wake) the
 *   hover provider. Also: FreeMarker directives, FTL directives,
 *   directive reference, LSP completion catalog.
 * rationale: Shared catalog so completion + hover stay in sync.
 * applies: editing FreeMarker directives, adding LSP completion items, wiring hover content for directives, expanding the Phase 1 directive set
 * seeded_questions:
 *   - "What FreeMarker directives does the extension know about?"
 *   - "Where is the directive reference catalog?"
 *   - "FreeMarker directive signatures"
 * @scry.entry.end
 */

/**
 * Category groupings for FreeMarker directives — used by the LSP
 * client to bucket completion items under a sensible heading.
 */
export type DirectiveCategory =
  | 'flow-control'
  | 'definition'
  | 'inclusion'
  | 'output'
  | 'escape'
  | 'error-handling'
  | 'meta';

export interface DirectiveRecord {
  /** Bare directive name without the `<#` / `</#` framing. */
  readonly name: string;
  /** Canonical FTL signature, including framing tags. */
  readonly signature: string;
  /** One-sentence plain-English summary. */
  readonly summary: string;
  /** Grouping for UX presentation. */
  readonly category: DirectiveCategory;
  /**
   * Body indicator. `'block'` directives expect a body and produce a
   * closing tag; `'inline'` ones are self-contained or paired-by-sibling
   * (e.g. `<#else>` inside `<#if>`).
   */
  readonly shape: 'block' | 'inline';
}

/**
 * The 32-entry closed Phase 1 set. Order matches design doc §4 Phase 1
 * item 1, except siblings (`else`, `elseif`, `case`, `default`, `break`,
 * `continue`, `return`) are kept beside their parent for readability.
 */
export const DIRECTIVES: readonly DirectiveRecord[] = [
  // Flow control
  {
    name: 'if',
    signature: '<#if expr>...<#elseif expr>...<#else>...</#if>',
    summary: 'Conditionally include content based on a boolean expression.',
    category: 'flow-control',
    shape: 'block',
  },
  {
    name: 'elseif',
    signature: '<#elseif expr>',
    summary: 'Additional branch of an enclosing <#if> directive.',
    category: 'flow-control',
    shape: 'inline',
  },
  {
    name: 'else',
    signature: '<#else>',
    summary: 'Fallback branch of an enclosing <#if> or <#list> directive.',
    category: 'flow-control',
    shape: 'inline',
  },
  {
    name: 'list',
    signature: '<#list seq as item>...<#else>...</#list>',
    summary: 'Iterate over a sequence or hash, with optional empty-case branch.',
    category: 'flow-control',
    shape: 'block',
  },
  {
    name: 'switch',
    signature: '<#switch expr><#case v>...<#break></#switch>',
    summary: 'Dispatch on a value through a sequence of <#case> arms.',
    category: 'flow-control',
    shape: 'block',
  },
  {
    name: 'case',
    signature: '<#case value>',
    summary: 'Arm of an enclosing <#switch> directive.',
    category: 'flow-control',
    shape: 'inline',
  },
  {
    name: 'default',
    signature: '<#default>',
    summary: 'Fallback arm of an enclosing <#switch> directive.',
    category: 'flow-control',
    shape: 'inline',
  },
  {
    name: 'break',
    signature: '<#break>',
    summary: 'Exit the nearest enclosing <#list> or <#switch> body.',
    category: 'flow-control',
    shape: 'inline',
  },
  {
    name: 'continue',
    signature: '<#continue>',
    summary: 'Skip to the next iteration of the nearest <#list> body.',
    category: 'flow-control',
    shape: 'inline',
  },
  {
    name: 'return',
    signature: '<#return>',
    summary: 'Return from the enclosing <#function> or <#macro>.',
    category: 'flow-control',
    shape: 'inline',
  },
  {
    name: 'stop',
    signature: '<#stop "reason">',
    summary: 'Halt template processing with an optional error reason.',
    category: 'flow-control',
    shape: 'inline',
  },

  // Definitions
  {
    name: 'assign',
    signature: '<#assign name=value>',
    summary: 'Create or update a variable in the template namespace.',
    category: 'definition',
    shape: 'inline',
  },
  {
    name: 'local',
    signature: '<#local name=value>',
    summary: 'Create or update a variable in the enclosing macro/function local scope.',
    category: 'definition',
    shape: 'inline',
  },
  {
    name: 'global',
    signature: '<#global name=value>',
    summary: 'Create or update a variable in the global (data-model-shadowing) namespace.',
    category: 'definition',
    shape: 'inline',
  },
  {
    name: 'macro',
    signature: '<#macro name param1 param2=default>...</#macro>',
    summary: 'Define a reusable user-directive (macro) with positional and defaulted parameters.',
    category: 'definition',
    shape: 'block',
  },
  {
    name: 'function',
    signature: '<#function name(param1, param2)>...<#return value></#function>',
    summary: 'Define a callable expression-context function.',
    category: 'definition',
    shape: 'block',
  },
  {
    name: 'nested',
    signature: '<#nested loopvar1, loopvar2>',
    summary: 'Render the nested content passed to the enclosing <#macro>.',
    category: 'definition',
    shape: 'inline',
  },

  // Inclusion
  {
    name: 'include',
    signature: '<#include "path">',
    summary: 'Inline another template into the current output.',
    category: 'inclusion',
    shape: 'inline',
  },
  {
    name: 'import',
    signature: '<#import "path" as ns>',
    summary: 'Load another template as a namespace of definitions.',
    category: 'inclusion',
    shape: 'inline',
  },

  // Output / escaping
  {
    name: 'setting',
    signature: '<#setting name=value>',
    summary: 'Override a FreeMarker engine setting (locale, number_format, output_format, …) for the rest of the template.',
    category: 'output',
    shape: 'inline',
  },
  {
    name: 'compress',
    signature: '<#compress>...</#compress>',
    summary: 'Collapse runs of whitespace in the enclosed output.',
    category: 'output',
    shape: 'block',
  },
  {
    name: 'escape',
    signature: '<#escape x as expr(x)>...</#escape>',
    summary: 'Wrap every interpolation in the enclosed body with an escape expression.',
    category: 'escape',
    shape: 'block',
  },
  {
    name: 'noescape',
    signature: '<#noescape>...</#noescape>',
    summary: 'Disable a surrounding <#escape> for the enclosed body.',
    category: 'escape',
    shape: 'block',
  },
  {
    name: 'outputformat',
    signature: '<#outputformat "HTML">...</#outputformat>',
    summary: 'Set the auto-escaping output format for the enclosed body.',
    category: 'escape',
    shape: 'block',
  },
  {
    name: 'noautoesc',
    signature: '<#noautoesc>...</#noautoesc>',
    summary: 'Disable auto-escaping for the enclosed body.',
    category: 'escape',
    shape: 'block',
  },

  // Whitespace meta directives
  {
    name: 't',
    signature: '<#t>',
    summary: 'Trim leading and trailing whitespace on this line of source.',
    category: 'meta',
    shape: 'inline',
  },
  {
    name: 'lt',
    signature: '<#lt>',
    summary: 'Trim leading whitespace on this line of source.',
    category: 'meta',
    shape: 'inline',
  },
  {
    name: 'rt',
    signature: '<#rt>',
    summary: 'Trim trailing whitespace on this line of source.',
    category: 'meta',
    shape: 'inline',
  },
  {
    name: 'nt',
    signature: '<#nt>',
    summary: 'Suppress whitespace trimming on this line of source.',
    category: 'meta',
    shape: 'inline',
  },
  {
    name: 'noparse',
    signature: '<#noparse>...</#noparse>',
    summary: 'Emit the enclosed body verbatim; do not parse FreeMarker syntax inside it.',
    category: 'meta',
    shape: 'block',
  },
  {
    name: 'ftl',
    signature: '<#ftl encoding="UTF-8" output_format="HTML">',
    summary: 'Per-template header directive setting engine-level options for this template.',
    category: 'meta',
    shape: 'inline',
  },

  // Error handling
  {
    name: 'attempt',
    signature: '<#attempt>...<#recover>...</#attempt>',
    summary: 'Try a body and run the <#recover> arm if it throws.',
    category: 'error-handling',
    shape: 'block',
  },
  {
    name: 'recover',
    signature: '<#recover>',
    summary: 'Recovery arm of an enclosing <#attempt> directive.',
    category: 'error-handling',
    shape: 'inline',
  },
];

/**
 * Returns true iff `name` is a known directive in the catalog.
 * O(n) over a 33-entry array — fine for completion-time use.
 */
export function isKnownDirective(name: string): boolean {
  return DIRECTIVES.some((d) => d.name === name);
}
