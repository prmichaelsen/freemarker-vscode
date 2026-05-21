/* @scry.entry
 * id: code.freemarker-builtins-catalog-test~3a82d7c0
 * kind: code
 * status: active
 * weight: 0.6
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:catalog", "catalog", "topic:test", "test", "jest", "builtins"]
 * summary: >
 *   Jest unit tests for the FreeMarker builtin catalog. Verifies
 *   record shape (name/signature/summary/category), no-duplicate
 *   names, catalog count regression guard (82), and high-frequency
 *   builtin coverage (upper_case, lower_case, size, length, html,
 *   keys, values). Also: builtin catalog regression guard, BUILTINS
 *   test, jest builtin tests.
 * rationale: Without these tests a catalog edit could silently break completion / hover or drop a high-frequency builtin.
 * applies: editing BUILTINS, adding a builtin entry, regressing the catalog shape
 * seeded_questions:
 *   - "How does the freemarker server verify BUILTINS shape?"
 *   - "How is the builtin catalog regression-guarded?"
 *   - "BUILTINS jest test"
 * @scry.entry.end
 */

import {
  BUILTINS,
  BUILTIN_URL_OVERRIDES,
  builtinDocumentationUri,
  isKnownBuiltin,
} from './builtins';

describe('BUILTINS catalog', () => {
  test('every record has the required catalog shape', () => {
    for (const b of BUILTINS) {
      expect(typeof b.name).toBe('string');
      expect(b.name.length).toBeGreaterThan(0);
      expect(typeof b.signature).toBe('string');
      expect(b.signature.length).toBeGreaterThan(0);
      expect(typeof b.summary).toBe('string');
      expect(b.summary.length).toBeGreaterThan(0);
      expect(typeof b.category).toBe('string');
      expect(b.category.length).toBeGreaterThan(0);
      expect(typeof b.documentationUri).toBe('string');
      // Every URL points at a `ref_builtins_<slug>.html` page on the
      // FreeMarker manual; the fragment is optional (deprecated
      // builtins with no per-name anchor link to the page only) and
      // when present is alphanumeric/underscore (the manual uses
      // both `ref_builtin_<name>` and the `isType` mixed-case variant).
      expect(b.documentationUri).toMatch(
        /^https:\/\/freemarker\.apache\.org\/docs\/ref_builtins_[a-z_]+\.html(#[A-Za-z0-9_]+)?$/,
      );
    }
  });

  test('no duplicate builtin names', () => {
    const seen = new Set<string>();
    for (const b of BUILTINS) {
      expect(seen.has(b.name)).toBe(false);
      seen.add(b.name);
    }
  });

  test('catalog count is 81 (regression guard)', () => {
    // Bump this number when the catalog intentionally grows.
    // (Was 82 prior to dedupe of `eval` from `meta` — already in `string`.)
    expect(BUILTINS.length).toBe(81);
  });

  test('high-frequency builtins are present', () => {
    const required = [
      // string
      'upper_case',
      'lower_case',
      'cap_first',
      'trim',
      'length',
      'contains',
      'replace',
      'split',
      'html',
      'xhtml',
      'url',
      'json_string',
      // sequence / hash
      'size',
      'first',
      'last',
      'reverse',
      'sort',
      'keys',
      'values',
      // numeric
      'string',
      'abs',
      'round',
      // date
      'date',
      'time',
      'datetime',
      'iso_utc',
      // boolean / meta
      'has_content',
      'is_string',
      'is_number',
    ];
    const names = new Set(BUILTINS.map((b) => b.name));
    for (const r of required) {
      expect(names.has(r)).toBe(true);
    }
  });

  test('isKnownBuiltin resolves known + unknown', () => {
    expect(isKnownBuiltin('upper_case')).toBe(true);
    expect(isKnownBuiltin('size')).toBe(true);
    expect(isKnownBuiltin('notABuiltin')).toBe(false);
  });

  test('documentationUri maps category → page for non-overridden builtins', () => {
    // Pick one non-overridden builtin per category and assert the
    // default `ref_builtins_<page>.html#ref_builtin_<name>` shape.
    expect(builtinDocumentationUri('upper_case', 'string')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_string.html#ref_builtin_upper_case',
    );
    expect(builtinDocumentationUri('size', 'sequence')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_sequence.html#ref_builtin_size',
    );
    expect(builtinDocumentationUri('keys', 'hash')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_hash.html#ref_builtin_keys',
    );
    // `numeric` category → `number` page slug
    expect(builtinDocumentationUri('abs', 'numeric')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_number.html#ref_builtin_abs',
    );
    expect(builtinDocumentationUri('then', 'boolean')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_boolean.html#ref_builtin_then',
    );
    expect(builtinDocumentationUri('children', 'node')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_node.html#ref_builtin_children',
    );
  });

  test('documentationUri honors BUILTIN_URL_OVERRIDES for known drift cases', () => {
    // Cross-page (lives on the `expert` reference page).
    expect(builtinDocumentationUri('eval', 'string')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_expert.html#ref_builtin_eval',
    );
    expect(builtinDocumentationUri('interpret', 'string')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_expert.html#ref_builtin_interpret',
    );
    expect(builtinDocumentationUri('new', 'meta')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_expert.html#ref_builtin_new',
    );
    expect(builtinDocumentationUri('has_content', 'meta')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_expert.html#ref_builtin_has_content',
    );

    // Shared `ref_builtin_isType` anchor on expert for the is_* family.
    expect(builtinDocumentationUri('is_string', 'meta')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_expert.html#ref_builtin_isType',
    );
    expect(builtinDocumentationUri('is_directive', 'meta')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_expert.html#ref_builtin_isType',
    );

    // Shared anchor on the category page.
    expect(builtinDocumentationUri('min', 'sequence')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_sequence.html#ref_builtin_min_max',
    );
    expect(builtinDocumentationUri('max', 'sequence')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_sequence.html#ref_builtin_min_max',
    );
    expect(builtinDocumentationUri('round', 'numeric')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_number.html#ref_builtin_rounding',
    );
    expect(builtinDocumentationUri('floor', 'numeric')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_number.html#ref_builtin_rounding',
    );
    expect(builtinDocumentationUri('ceiling', 'numeric')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_number.html#ref_builtin_rounding',
    );
    expect(builtinDocumentationUri('int', 'numeric')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_number.html#ref_builtin_rounding',
    );
    expect(builtinDocumentationUri('string', 'numeric')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_number.html#ref_builtin_string_for_number',
    );
    expect(builtinDocumentationUri('date', 'date')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_date.html#ref_builtin_date_datetype',
    );
    expect(builtinDocumentationUri('time', 'date')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_date.html#ref_builtin_date_datetype',
    );
    expect(builtinDocumentationUri('datetime', 'date')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_date.html#ref_builtin_date_datetype',
    );
    expect(builtinDocumentationUri('iso_utc', 'date')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_date.html#ref_builtin_date_iso',
    );
    expect(builtinDocumentationUri('iso_local', 'date')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_date.html#ref_builtin_date_iso',
    );

    // Deprecated builtins with no per-name anchor — page-only URL.
    expect(builtinDocumentationUri('default', 'meta')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_type_independent.html',
    );
    expect(builtinDocumentationUri('exists', 'meta')).toBe(
      'https://freemarker.apache.org/docs/ref_builtins_type_independent.html',
    );
  });

  test('every BUILTIN_URL_OVERRIDES key names a catalog builtin', () => {
    // Guards against an override row outliving the builtin it documents
    // (or being typoed in either direction).
    const names = new Set(BUILTINS.map((b) => b.name));
    for (const key of Object.keys(BUILTIN_URL_OVERRIDES)) {
      expect(names.has(key)).toBe(true);
    }
  });

  test('every catalog builtin produces the URL its category + override imply', () => {
    // Ensures the live `documentationUri` field on every record agrees
    // with what `builtinDocumentationUri(name, category)` would build.
    // This is the load-bearing invariant: hover and completion both
    // read the field directly, so a record's URL must match what the
    // builder + overrides resolve to.
    for (const b of BUILTINS) {
      expect(b.documentationUri).toBe(builtinDocumentationUri(b.name, b.category));
    }
  });
});
