import { describe, expect, it } from 'vitest';
import { AUTUMN_MONTHS, isAutumnSeason, parseLeafPreference, shouldShowLeaves } from './season';

const inMonth = (month: number) => new Date(Date.UTC(2026, month, 15, 12));

describe('Herbstlaub nur im Herbst', () => {
  it('zählt September, Oktober und November als Herbst', () => {
    for (const month of AUTUMN_MONTHS) expect(isAutumnSeason(inMonth(month)), `Monat ${month}`).toBe(true);
    for (const month of [0, 1, 2, 3, 4, 5, 6, 7, 11]) expect(isAutumnSeason(inMonth(month)), `Monat ${month}`).toBe(false);
  });

  it('lässt eine ausdrückliche Wahl die Jahreszeit überstimmen', () => {
    expect(shouldShowLeaves('auto', inMonth(9))).toBe(true);
    expect(shouldShowLeaves('auto', inMonth(3))).toBe(false);
    expect(shouldShowLeaves('on', inMonth(3))).toBe(true);
    expect(shouldShowLeaves('off', inMonth(9))).toBe(false);
  });

  it('liest nur bekannte gespeicherte Werte', () => {
    expect(parseLeafPreference('on')).toBe('on');
    expect(parseLeafPreference('off')).toBe('off');
    expect(parseLeafPreference(null)).toBe('auto');
    expect(parseLeafPreference('yes')).toBe('auto');
    expect(parseLeafPreference('')).toBe('auto');
  });
});
