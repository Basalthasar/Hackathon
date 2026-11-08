import { describe, expect, it } from 'vitest';
import { DEFAULT_LEAF_PREFERENCE, parseLeafPreference } from './leaves';

describe('Herbstlaub ist standardmäßig aus', () => {
  it('startet ohne gespeicherte Wahl aus', () => {
    expect(DEFAULT_LEAF_PREFERENCE).toBe('off');
    expect(parseLeafPreference(null)).toBe('off');
  });

  it('aktiviert nur eine ausdrückliche Wahl', () => {
    expect(parseLeafPreference('on')).toBe('on');
    expect(parseLeafPreference('off')).toBe('off');
    expect(parseLeafPreference('auto')).toBe('off');
    expect(parseLeafPreference('yes')).toBe('off');
    expect(parseLeafPreference('')).toBe('off');
  });
});
