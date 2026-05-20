/* @scry.entry
 * id: code.freemarker-builtins-catalog~7abd40e0
 * kind: pattern
 * status: active
 * weight: 0.7
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:catalog", "catalog", "freemarker-vscode", "builtins", "topic:builtins"]
 * summary: >
 *   Catalog of FreeMarker built-in functions (the `?name` suffix
 *   operators). Sourced from the FreeMarker reference manual,
 *   grouped by operand category (string, sequence, hash, numeric,
 *   boolean, date, node, meta). Feeds the LSP completion provider
 *   when the user types `?` after an expression, and the hover
 *   provider once that wires through. Also: FreeMarker built-ins,
 *   FTL built-ins, ?upper_case, ?size, ?html, ?date, built-in
 *   reference, LSP completion catalog.
 * rationale: Shared catalog so completion + hover stay in sync across the built-in surface.
 * applies: editing FreeMarker built-in entries, wiring ? completion, surfacing built-in hover content, sequencing the Phase 1 built-in surface
 * seeded_questions:
 *   - "What FreeMarker built-in functions does the extension know about?"
 *   - "Where is the FTL ?builtin reference catalog?"
 *   - "FreeMarker string built-ins"
 *   - "FreeMarker sequence built-ins"
 *   - "?upper_case ?size ?html ?date"
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
}

/**
 * Phase 1 built-in surface. Not exhaustive of the entire FreeMarker
 * reference, but extends well past the partial list in the design
 * doc — covers the high-frequency string, sequence, hash, numeric,
 * boolean, date, and meta built-ins template authors reach for
 * routinely.
 */
export const BUILTINS: readonly BuiltinRecord[] = [
  // ---- String built-ins ----
  { name: 'upper_case', signature: 'string?upper_case → string', summary: 'Convert the operand string to upper case.', category: 'string' },
  { name: 'lower_case', signature: 'string?lower_case → string', summary: 'Convert the operand string to lower case.', category: 'string' },
  { name: 'cap_first', signature: 'string?cap_first → string', summary: 'Capitalize the first letter of the operand string.', category: 'string' },
  { name: 'uncap_first', signature: 'string?uncap_first → string', summary: 'Lower-case the first letter of the operand string.', category: 'string' },
  { name: 'capitalize', signature: 'string?capitalize → string', summary: 'Capitalize the first letter of each word in the operand string.', category: 'string' },
  { name: 'trim', signature: 'string?trim → string', summary: 'Remove leading and trailing whitespace from the operand string.', category: 'string' },
  { name: 'length', signature: 'string?length → number', summary: 'Number of characters in the operand string.', category: 'string' },
  { name: 'index_of', signature: 'string?index_of(sub, from?) → number', summary: 'Position of the first occurrence of a substring, or -1 if absent.', category: 'string' },
  { name: 'last_index_of', signature: 'string?last_index_of(sub, from?) → number', summary: 'Position of the last occurrence of a substring, or -1 if absent.', category: 'string' },
  { name: 'contains', signature: 'string?contains(sub) → boolean', summary: 'True if the operand string contains a substring.', category: 'string' },
  { name: 'starts_with', signature: 'string?starts_with(prefix) → boolean', summary: 'True if the operand string starts with a prefix.', category: 'string' },
  { name: 'ends_with', signature: 'string?ends_with(suffix) → boolean', summary: 'True if the operand string ends with a suffix.', category: 'string' },
  { name: 'replace', signature: 'string?replace(from, to, flags?) → string', summary: 'Replace all occurrences of a substring with another.', category: 'string' },
  { name: 'matches', signature: 'string?matches(regex, flags?) → boolean', summary: 'Match the operand string against a regular expression.', category: 'string' },
  { name: 'split', signature: 'string?split(sep, flags?) → sequence<string>', summary: 'Split the operand string around occurrences of a separator.', category: 'string' },
  { name: 'substring', signature: 'string?substring(from, to?) → string', summary: 'Extract a substring by character offsets.', category: 'string' },
  { name: 'left_pad', signature: 'string?left_pad(width, filler?) → string', summary: 'Pad the operand string on the left to a given width.', category: 'string' },
  { name: 'right_pad', signature: 'string?right_pad(width, filler?) → string', summary: 'Pad the operand string on the right to a given width.', category: 'string' },
  { name: 'word_list', signature: 'string?word_list → sequence<string>', summary: 'Split the operand string on whitespace into a sequence of words.', category: 'string' },
  { name: 'html', signature: 'string?html → string', summary: 'Escape HTML-significant characters in the operand string (deprecated alias for ?xhtml).', category: 'string' },
  { name: 'xhtml', signature: 'string?xhtml → string', summary: 'Escape XHTML-significant characters in the operand string.', category: 'string' },
  { name: 'xml', signature: 'string?xml → string', summary: 'Escape XML-significant characters in the operand string.', category: 'string' },
  { name: 'js_string', signature: 'string?js_string → string', summary: 'Escape the operand string for use inside a JavaScript string literal.', category: 'string' },
  { name: 'json_string', signature: 'string?json_string → string', summary: 'Escape the operand string for use inside a JSON string literal.', category: 'string' },
  { name: 'url', signature: 'string?url(charset?) → string', summary: 'URL-encode the operand string with an optional charset.', category: 'string' },
  { name: 'url_path', signature: 'string?url_path(charset?) → string', summary: 'URL-encode the operand string for use in a URL path segment.', category: 'string' },
  { name: 'number', signature: 'string?number → number', summary: 'Parse the operand string as a number.', category: 'string' },
  { name: 'boolean', signature: 'string?boolean → boolean', summary: 'Parse the operand string as a boolean ("true" / "false").', category: 'string' },
  { name: 'eval', signature: 'string?eval → any', summary: 'Evaluate the operand string as a FreeMarker expression.', category: 'string' },
  { name: 'interpret', signature: 'string?interpret → directive', summary: 'Compile the operand string as a FreeMarker template fragment for later inclusion.', category: 'string' },

  // ---- Sequence built-ins ----
  { name: 'size', signature: 'sequence?size → number', summary: 'Number of items in the operand sequence (also valid on hashes / strings).', category: 'sequence' },
  { name: 'first', signature: 'sequence?first → any', summary: 'First item of the operand sequence.', category: 'sequence' },
  { name: 'last', signature: 'sequence?last → any', summary: 'Last item of the operand sequence.', category: 'sequence' },
  { name: 'reverse', signature: 'sequence?reverse → sequence', summary: 'Return a sequence with the items in reverse order.', category: 'sequence' },
  { name: 'sort', signature: 'sequence?sort → sequence', summary: 'Return a sequence sorted by natural ordering of its items.', category: 'sequence' },
  { name: 'sort_by', signature: 'sequence?sort_by(key) → sequence', summary: 'Return a sequence sorted by a hash key (or chain of keys) within each item.', category: 'sequence' },
  { name: 'seq_contains', signature: 'sequence?seq_contains(item) → boolean', summary: 'True if the operand sequence contains the given item.', category: 'sequence' },
  { name: 'seq_index_of', signature: 'sequence?seq_index_of(item, from?) → number', summary: 'Index of the first occurrence of an item in the operand sequence, or -1 if absent.', category: 'sequence' },
  { name: 'seq_last_index_of', signature: 'sequence?seq_last_index_of(item, from?) → number', summary: 'Index of the last occurrence of an item in the operand sequence, or -1 if absent.', category: 'sequence' },
  { name: 'join', signature: 'sequence?join(sep, empty?, last_sep?) → string', summary: 'Concatenate the operand sequence into a string with a separator.', category: 'sequence' },
  { name: 'chunk', signature: 'sequence?chunk(size, filler?) → sequence<sequence>', summary: 'Split the operand sequence into fixed-size chunks, optionally padded by a filler.', category: 'sequence' },
  { name: 'min', signature: 'sequence?min → any', summary: 'Smallest item in the operand sequence (numeric or comparable).', category: 'sequence' },
  { name: 'max', signature: 'sequence?max → any', summary: 'Largest item in the operand sequence (numeric or comparable).', category: 'sequence' },
  { name: 'filter', signature: 'sequence?filter(predicate) → sequence', summary: 'Return only items for which the predicate function returns true.', category: 'sequence' },
  { name: 'map', signature: 'sequence?map(function) → sequence', summary: 'Apply a function to every item in the operand sequence.', category: 'sequence' },
  { name: 'take_while', signature: 'sequence?take_while(predicate) → sequence', summary: 'Return the leading items for which the predicate returns true.', category: 'sequence' },
  { name: 'drop_while', signature: 'sequence?drop_while(predicate) → sequence', summary: 'Drop the leading items for which the predicate returns true.', category: 'sequence' },

  // ---- Hash built-ins ----
  { name: 'keys', signature: 'hash?keys → sequence<string>', summary: 'Sequence of keys in the operand hash.', category: 'hash' },
  { name: 'values', signature: 'hash?values → sequence', summary: 'Sequence of values in the operand hash.', category: 'hash' },

  // ---- Numeric built-ins ----
  { name: 'abs', signature: 'number?abs → number', summary: 'Absolute value of the operand number.', category: 'numeric' },
  { name: 'round', signature: 'number?round → number', summary: 'Round the operand number to the nearest integer.', category: 'numeric' },
  { name: 'floor', signature: 'number?floor → number', summary: 'Largest integer not greater than the operand number.', category: 'numeric' },
  { name: 'ceiling', signature: 'number?ceiling → number', summary: 'Smallest integer not less than the operand number.', category: 'numeric' },
  { name: 'int', signature: 'number?int → number', summary: 'Truncate the operand number toward zero.', category: 'numeric' },
  { name: 'string', signature: 'number?string(format?) → string', summary: 'Format the operand number using the given pattern (or the engine default).', category: 'numeric' },
  { name: 'c', signature: 'number?c → string', summary: 'Format the operand number in computer/locale-independent form.', category: 'numeric' },
  { name: 'is_infinite', signature: 'number?is_infinite → boolean', summary: 'True if the operand number is infinite.', category: 'numeric' },
  { name: 'is_nan', signature: 'number?is_nan → boolean', summary: 'True if the operand number is NaN.', category: 'numeric' },

  // ---- Boolean built-ins ----
  { name: 'then', signature: 'boolean?then(whenTrue, whenFalse) → any', summary: 'Return one of two values depending on the operand boolean (ternary).', category: 'boolean' },

  // ---- Date built-ins ----
  { name: 'date', signature: 'datelike?date → date / string?date(pattern?) → date', summary: 'Coerce the operand to / parse the operand as a date-only value.', category: 'date' },
  { name: 'time', signature: 'datelike?time → time / string?time(pattern?) → time', summary: 'Coerce the operand to / parse the operand as a time-only value.', category: 'date' },
  { name: 'datetime', signature: 'datelike?datetime → datetime / string?datetime(pattern?) → datetime', summary: 'Coerce the operand to / parse the operand as a date-and-time value.', category: 'date' },
  { name: 'iso_utc', signature: 'datelike?iso_utc → string', summary: 'Format the operand date as an ISO 8601 string in UTC.', category: 'date' },
  { name: 'iso_local', signature: 'datelike?iso_local → string', summary: 'Format the operand date as an ISO 8601 string in the engine\'s local time zone.', category: 'date' },

  // ---- Node (XML / DOM) built-ins ----
  { name: 'children', signature: 'node?children → sequence<node>', summary: 'Sequence of child nodes of the operand XML/DOM node.', category: 'node' },
  { name: 'parent', signature: 'node?parent → node', summary: 'Parent of the operand XML/DOM node.', category: 'node' },
  { name: 'node_name', signature: 'node?node_name → string', summary: 'Name of the operand XML/DOM node.', category: 'node' },
  { name: 'node_type', signature: 'node?node_type → string', summary: 'Type of the operand XML/DOM node (element, text, attribute, …).', category: 'node' },
  { name: 'ancestors', signature: 'node?ancestors(name?) → sequence<node>', summary: 'Sequence of ancestor nodes of the operand, optionally filtered by name.', category: 'node' },

  // ---- Meta / introspection built-ins ----
  { name: 'is_string', signature: 'any?is_string → boolean', summary: 'True if the operand is a string.', category: 'meta' },
  { name: 'is_number', signature: 'any?is_number → boolean', summary: 'True if the operand is a number.', category: 'meta' },
  { name: 'is_boolean', signature: 'any?is_boolean → boolean', summary: 'True if the operand is a boolean.', category: 'meta' },
  { name: 'is_date', signature: 'any?is_date → boolean', summary: 'True if the operand is a date / time / datetime value.', category: 'meta' },
  { name: 'is_sequence', signature: 'any?is_sequence → boolean', summary: 'True if the operand is a sequence.', category: 'meta' },
  { name: 'is_hash', signature: 'any?is_hash → boolean', summary: 'True if the operand is a hash.', category: 'meta' },
  { name: 'is_macro', signature: 'any?is_macro → boolean', summary: 'True if the operand is a user-defined macro.', category: 'meta' },
  { name: 'is_directive', signature: 'any?is_directive → boolean', summary: 'True if the operand is a directive (built-in or user macro).', category: 'meta' },
  { name: 'has_content', signature: 'any?has_content → boolean', summary: 'True if the operand is non-null and non-empty.', category: 'meta' },
  { name: 'default', signature: 'any?default(fallback) → any', summary: 'Return the operand if it has content, otherwise return the fallback.', category: 'meta' },
  { name: 'exists', signature: 'any?exists → boolean', summary: 'True if the operand is defined (deprecated; prefer ?has_content / ??).', category: 'meta' },
  { name: 'eval', signature: 'string?eval → any', summary: 'Evaluate the operand string as a FreeMarker expression.', category: 'meta' },
  { name: 'new', signature: 'classname?new(args…) → any', summary: 'Instantiate the named class as a FreeMarker model (where the engine permits it).', category: 'meta' },
];

/**
 * Returns true iff `name` is a known built-in in the catalog.
 * O(n) over a fixed array — fine for completion-time use.
 */
export function isKnownBuiltin(name: string): boolean {
  return BUILTINS.some((b) => b.name === name);
}
