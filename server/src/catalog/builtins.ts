/* @scry.entry
 * id: code.freemarker-builtins-catalog~7abd40e0
 * kind: pattern
 * status: active
 * weight: 0.7
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:catalog", "catalog", "freemarker-vscode", "builtins", "topic:builtins", "topic:documentation-uri", "documentation-uri"]
 * summary: >
 *   Catalog of FreeMarker built-in functions (the `?name` suffix
 *   operators). Sourced from the FreeMarker reference manual,
 *   grouped by operand category (string, sequence, hash, numeric,
 *   boolean, date, node, meta). Each record carries name, signature,
 *   summary, category, and documentationUri (canonical
 *   freemarker.apache.org reference page with #ref_builtin_<name>
 *   anchor). Feeds the LSP completion provider when the user types
 *   `?` after an expression, and the hover provider. Also:
 *   FreeMarker built-ins, FTL built-ins, ?upper_case, ?size, ?html,
 *   ?date, built-in reference, LSP completion catalog,
 *   documentationUri, ref_builtin anchor, hover Reference link.
 * rationale: Shared catalog so completion + hover stay in sync; documentationUri lets the hover Markdown link out to the canonical reference page anchor.
 * applies: editing FreeMarker built-in entries, wiring ? completion, surfacing built-in hover content, sequencing the Phase 1 built-in surface, refreshing canonical documentation URLs
 * seeded_questions:
 *   - "What FreeMarker built-in functions does the extension know about?"
 *   - "Where is the FTL ?builtin reference catalog?"
 *   - "FreeMarker string built-ins"
 *   - "FreeMarker sequence built-ins"
 *   - "?upper_case ?size ?html ?date"
 *   - "freemarker-vscode builtin documentationUri"
 *   - "ref_builtin_<name> anchor"
 * @scry.entry.end
 */

/**
 * Operand-category groupings for FreeMarker built-in functions.
 */
export type BuiltinCategory =
  | 'string'
  | 'sequence'
  | 'hash'
  | 'numeric'
  | 'boolean'
  | 'date'
  | 'node'
  | 'meta';

export interface BuiltinRecord {
  /** Bare built-in name without the leading `?`. */
  readonly name: string;
  /** Canonical FTL signature, including the leading `?`. */
  readonly signature: string;
  /** One-sentence plain-English summary. */
  readonly summary: string;
  /** Grouping for UX presentation. */
  readonly category: BuiltinCategory;
  /**
   * Canonical freemarker.apache.org reference URL with the per-builtin
   * `#ref_builtin_<name>` anchor. Always fully qualified; the hover
   * Markdown emits it verbatim as a Reference link.
   */
  readonly documentationUri: string;
}

/** Base URL for the FreeMarker reference manual. */
const REF = 'https://freemarker.apache.org/docs';

/**
 * Map a BuiltinCategory to its FreeMarker reference page slug.
 *
 * Notes:
 *   - `numeric` maps to the singular `number` page name used by the
 *     FreeMarker manual.
 *   - `meta` maps to `type_independent` (catches is_X, has_content,
 *     default, exists). The single outlier (`new`, which the manual
 *     places in the expert page) is handled by an override in the
 *     record below rather than by splitting the category enum.
 */
const CATEGORY_TO_PAGE_SLUG: Record<BuiltinCategory, string> = {
  string: 'string',
  sequence: 'sequence',
  hash: 'hash',
  numeric: 'number',
  boolean: 'boolean',
  date: 'date',
  node: 'node',
  meta: 'type_independent',
};

/**
 * Build the canonical reference URL for a builtin. Exported so tests
 * can assert the URL shape without hand-typing 81 absolute URLs.
 */
export function builtinDocumentationUri(
  name: string,
  category: BuiltinCategory,
): string {
  // The `new` builtin lives on the "expert" page in the manual rather
  // than `type_independent`; everything else follows the category map.
  if (category === 'meta' && name === 'new') {
    return `${REF}/ref_builtins_expert.html#ref_builtin_new`;
  }
  return `${REF}/ref_builtins_${CATEGORY_TO_PAGE_SLUG[category]}.html#ref_builtin_${name}`;
}

const B = (
  name: string,
  signature: string,
  summary: string,
  category: BuiltinCategory,
): BuiltinRecord => ({
  name,
  signature,
  summary,
  category,
  documentationUri: builtinDocumentationUri(name, category),
});

/**
 * Phase 1 built-in surface. Not exhaustive of the entire FreeMarker
 * reference, but extends well past the partial list in the design
 * doc — covers the high-frequency string, sequence, hash, numeric,
 * boolean, date, and meta built-ins template authors reach for
 * routinely.
 */
export const BUILTINS: readonly BuiltinRecord[] = [
  // ---- String built-ins ----
  B('upper_case', 'string?upper_case → string', 'Convert the operand string to upper case.', 'string'),
  B('lower_case', 'string?lower_case → string', 'Convert the operand string to lower case.', 'string'),
  B('cap_first', 'string?cap_first → string', 'Capitalize the first letter of the operand string.', 'string'),
  B('uncap_first', 'string?uncap_first → string', 'Lower-case the first letter of the operand string.', 'string'),
  B('capitalize', 'string?capitalize → string', 'Capitalize the first letter of each word in the operand string.', 'string'),
  B('trim', 'string?trim → string', 'Remove leading and trailing whitespace from the operand string.', 'string'),
  B('length', 'string?length → number', 'Number of characters in the operand string.', 'string'),
  B('index_of', 'string?index_of(sub, from?) → number', 'Position of the first occurrence of a substring, or -1 if absent.', 'string'),
  B('last_index_of', 'string?last_index_of(sub, from?) → number', 'Position of the last occurrence of a substring, or -1 if absent.', 'string'),
  B('contains', 'string?contains(sub) → boolean', 'True if the operand string contains a substring.', 'string'),
  B('starts_with', 'string?starts_with(prefix) → boolean', 'True if the operand string starts with a prefix.', 'string'),
  B('ends_with', 'string?ends_with(suffix) → boolean', 'True if the operand string ends with a suffix.', 'string'),
  B('replace', 'string?replace(from, to, flags?) → string', 'Replace all occurrences of a substring with another.', 'string'),
  B('matches', 'string?matches(regex, flags?) → boolean', 'Match the operand string against a regular expression.', 'string'),
  B('split', 'string?split(sep, flags?) → sequence<string>', 'Split the operand string around occurrences of a separator.', 'string'),
  B('substring', 'string?substring(from, to?) → string', 'Extract a substring by character offsets.', 'string'),
  B('left_pad', 'string?left_pad(width, filler?) → string', 'Pad the operand string on the left to a given width.', 'string'),
  B('right_pad', 'string?right_pad(width, filler?) → string', 'Pad the operand string on the right to a given width.', 'string'),
  B('word_list', 'string?word_list → sequence<string>', 'Split the operand string on whitespace into a sequence of words.', 'string'),
  B('html', 'string?html → string', 'Escape HTML-significant characters in the operand string (deprecated alias for ?xhtml).', 'string'),
  B('xhtml', 'string?xhtml → string', 'Escape XHTML-significant characters in the operand string.', 'string'),
  B('xml', 'string?xml → string', 'Escape XML-significant characters in the operand string.', 'string'),
  B('js_string', 'string?js_string → string', 'Escape the operand string for use inside a JavaScript string literal.', 'string'),
  B('json_string', 'string?json_string → string', 'Escape the operand string for use inside a JSON string literal.', 'string'),
  B('url', 'string?url(charset?) → string', 'URL-encode the operand string with an optional charset.', 'string'),
  B('url_path', 'string?url_path(charset?) → string', 'URL-encode the operand string for use in a URL path segment.', 'string'),
  B('number', 'string?number → number', 'Parse the operand string as a number.', 'string'),
  B('boolean', 'string?boolean → boolean', 'Parse the operand string as a boolean ("true" / "false").', 'string'),
  B('eval', 'string?eval → any', 'Evaluate the operand string as a FreeMarker expression.', 'string'),
  B('interpret', 'string?interpret → directive', 'Compile the operand string as a FreeMarker template fragment for later inclusion.', 'string'),

  // ---- Sequence built-ins ----
  B('size', 'sequence?size → number', 'Number of items in the operand sequence (also valid on hashes / strings).', 'sequence'),
  B('first', 'sequence?first → any', 'First item of the operand sequence.', 'sequence'),
  B('last', 'sequence?last → any', 'Last item of the operand sequence.', 'sequence'),
  B('reverse', 'sequence?reverse → sequence', 'Return a sequence with the items in reverse order.', 'sequence'),
  B('sort', 'sequence?sort → sequence', 'Return a sequence sorted by natural ordering of its items.', 'sequence'),
  B('sort_by', 'sequence?sort_by(key) → sequence', 'Return a sequence sorted by a hash key (or chain of keys) within each item.', 'sequence'),
  B('seq_contains', 'sequence?seq_contains(item) → boolean', 'True if the operand sequence contains the given item.', 'sequence'),
  B('seq_index_of', 'sequence?seq_index_of(item, from?) → number', 'Index of the first occurrence of an item in the operand sequence, or -1 if absent.', 'sequence'),
  B('seq_last_index_of', 'sequence?seq_last_index_of(item, from?) → number', 'Index of the last occurrence of an item in the operand sequence, or -1 if absent.', 'sequence'),
  B('join', 'sequence?join(sep, empty?, last_sep?) → string', 'Concatenate the operand sequence into a string with a separator.', 'sequence'),
  B('chunk', 'sequence?chunk(size, filler?) → sequence<sequence>', 'Split the operand sequence into fixed-size chunks, optionally padded by a filler.', 'sequence'),
  B('min', 'sequence?min → any', 'Smallest item in the operand sequence (numeric or comparable).', 'sequence'),
  B('max', 'sequence?max → any', 'Largest item in the operand sequence (numeric or comparable).', 'sequence'),
  B('filter', 'sequence?filter(predicate) → sequence', 'Return only items for which the predicate function returns true.', 'sequence'),
  B('map', 'sequence?map(function) → sequence', 'Apply a function to every item in the operand sequence.', 'sequence'),
  B('take_while', 'sequence?take_while(predicate) → sequence', 'Return the leading items for which the predicate returns true.', 'sequence'),
  B('drop_while', 'sequence?drop_while(predicate) → sequence', 'Drop the leading items for which the predicate returns true.', 'sequence'),

  // ---- Hash built-ins ----
  B('keys', 'hash?keys → sequence<string>', 'Sequence of keys in the operand hash.', 'hash'),
  B('values', 'hash?values → sequence', 'Sequence of values in the operand hash.', 'hash'),

  // ---- Numeric built-ins ----
  B('abs', 'number?abs → number', 'Absolute value of the operand number.', 'numeric'),
  B('round', 'number?round → number', 'Round the operand number to the nearest integer.', 'numeric'),
  B('floor', 'number?floor → number', 'Largest integer not greater than the operand number.', 'numeric'),
  B('ceiling', 'number?ceiling → number', 'Smallest integer not less than the operand number.', 'numeric'),
  B('int', 'number?int → number', 'Truncate the operand number toward zero.', 'numeric'),
  B('string', 'number?string(format?) → string', 'Format the operand number using the given pattern (or the engine default).', 'numeric'),
  B('c', 'number?c → string', 'Format the operand number in computer/locale-independent form.', 'numeric'),
  B('is_infinite', 'number?is_infinite → boolean', 'True if the operand number is infinite.', 'numeric'),
  B('is_nan', 'number?is_nan → boolean', 'True if the operand number is NaN.', 'numeric'),

  // ---- Boolean built-ins ----
  B('then', 'boolean?then(whenTrue, whenFalse) → any', 'Return one of two values depending on the operand boolean (ternary).', 'boolean'),

  // ---- Date built-ins ----
  B('date', 'datelike?date → date / string?date(pattern?) → date', 'Coerce the operand to / parse the operand as a date-only value.', 'date'),
  B('time', 'datelike?time → time / string?time(pattern?) → time', 'Coerce the operand to / parse the operand as a time-only value.', 'date'),
  B('datetime', 'datelike?datetime → datetime / string?datetime(pattern?) → datetime', 'Coerce the operand to / parse the operand as a date-and-time value.', 'date'),
  B('iso_utc', 'datelike?iso_utc → string', 'Format the operand date as an ISO 8601 string in UTC.', 'date'),
  B('iso_local', "datelike?iso_local → string", "Format the operand date as an ISO 8601 string in the engine's local time zone.", 'date'),

  // ---- Node (XML / DOM) built-ins ----
  B('children', 'node?children → sequence<node>', 'Sequence of child nodes of the operand XML/DOM node.', 'node'),
  B('parent', 'node?parent → node', 'Parent of the operand XML/DOM node.', 'node'),
  B('node_name', 'node?node_name → string', 'Name of the operand XML/DOM node.', 'node'),
  B('node_type', 'node?node_type → string', 'Type of the operand XML/DOM node (element, text, attribute, …).', 'node'),
  B('ancestors', 'node?ancestors(name?) → sequence<node>', 'Sequence of ancestor nodes of the operand, optionally filtered by name.', 'node'),

  // ---- Meta / introspection built-ins ----
  B('is_string', 'any?is_string → boolean', 'True if the operand is a string.', 'meta'),
  B('is_number', 'any?is_number → boolean', 'True if the operand is a number.', 'meta'),
  B('is_boolean', 'any?is_boolean → boolean', 'True if the operand is a boolean.', 'meta'),
  B('is_date', 'any?is_date → boolean', 'True if the operand is a date / time / datetime value.', 'meta'),
  B('is_sequence', 'any?is_sequence → boolean', 'True if the operand is a sequence.', 'meta'),
  B('is_hash', 'any?is_hash → boolean', 'True if the operand is a hash.', 'meta'),
  B('is_macro', 'any?is_macro → boolean', 'True if the operand is a user-defined macro.', 'meta'),
  B('is_directive', 'any?is_directive → boolean', 'True if the operand is a directive (built-in or user macro).', 'meta'),
  B('has_content', 'any?has_content → boolean', 'True if the operand is non-null and non-empty.', 'meta'),
  B('default', 'any?default(fallback) → any', 'Return the operand if it has content, otherwise return the fallback.', 'meta'),
  B('exists', 'any?exists → boolean', 'True if the operand is defined (deprecated; prefer ?has_content / ??).', 'meta'),
  B('new', 'classname?new(args…) → any', 'Instantiate the named class as a FreeMarker model (where the engine permits it).', 'meta'),
];

/**
 * Returns true iff `name` is a known built-in in the catalog.
 * O(n) over a fixed array — fine for completion-time use.
 */
export function isKnownBuiltin(name: string): boolean {
  return BUILTINS.some((b) => b.name === name);
}
