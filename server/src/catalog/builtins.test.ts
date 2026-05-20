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

import { BUILTINS, isKnownBuiltin } from './builtins';

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
});
