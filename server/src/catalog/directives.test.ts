/* @scry.entry
 * id: code.freemarker-directives-catalog-test~9b612af3
 * kind: code
 * status: active
 * weight: 0.6
 * tags: ["topic:freemarker", "freemarker", "topic:lsp", "lsp", "topic:catalog", "catalog", "topic:test", "test", "jest", "directives"]
 * summary: >
 *   Jest unit tests for the FreeMarker directive catalog. Verifies
 *   record shape (name/signature/summary/category/shape), no-duplicate
 *   names, expected count, and Phase 1 directive coverage. Also:
 *   catalog regression guard, DIRECTIVES test, jest catalog tests.
 * rationale: Without these tests a catalog edit could silently break completion / hover or drop a Phase 1 directive.
 * applies: editing DIRECTIVES, adding a directive entry, regressing the catalog shape
 * seeded_questions:
 *   - "How does the freemarker server verify DIRECTIVES shape?"
 *   - "How is the directive catalog regression-guarded?"
 *   - "DIRECTIVES jest test"
 * @scry.entry.end
 */

import { DIRECTIVES, isKnownDirective } from './directives';

describe('DIRECTIVES catalog', () => {
  test('every record has the required catalog shape', () => {
    for (const d of DIRECTIVES) {
      expect(typeof d.name).toBe('string');
      expect(d.name.length).toBeGreaterThan(0);
      expect(typeof d.signature).toBe('string');
      expect(d.signature.length).toBeGreaterThan(0);
      expect(typeof d.summary).toBe('string');
      expect(d.summary.length).toBeGreaterThan(0);
      expect(typeof d.category).toBe('string');
      expect(d.category.length).toBeGreaterThan(0);
      expect(d.shape === 'block' || d.shape === 'inline').toBe(true);
    }
  });

  test('no duplicate directive names', () => {
    const seen = new Set<string>();
    for (const d of DIRECTIVES) {
      expect(seen.has(d.name)).toBe(false);
      seen.add(d.name);
    }
  });

  test('catalog count matches the shipped Phase 1 surface (regression guard)', () => {
    // Bump this number when the catalog intentionally grows.
    expect(DIRECTIVES.length).toBe(33);
  });

  test('Phase 1 closed set is present', () => {
    const required = [
      'if',
      'else',
      'elseif',
      'list',
      'switch',
      'case',
      'default',
      'break',
      'continue',
      'return',
      'assign',
      'local',
      'global',
      'macro',
      'function',
      'nested',
      'include',
      'import',
      'attempt',
      'recover',
      'stop',
      'compress',
      'escape',
      'noescape',
      'outputformat',
      'noautoesc',
      'noparse',
      't',
      'lt',
      'rt',
      'nt',
      'ftl',
      'setting',
    ];
    const names = new Set(DIRECTIVES.map((d) => d.name));
    for (const r of required) {
      expect(names.has(r)).toBe(true);
    }
  });

  test('isKnownDirective resolves known + unknown', () => {
    expect(isKnownDirective('if')).toBe(true);
    expect(isKnownDirective('list')).toBe(true);
    expect(isKnownDirective('notADirective')).toBe(false);
  });
});
