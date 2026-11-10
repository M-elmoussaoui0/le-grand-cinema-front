import { dateIso, heure, prix } from './format';

describe('formatage', () => {
  it("affiche l'heure dans le fuseau du cinéma", () => {
    // 19:30 UTC = 20:30 à Paris en hiver
    expect(heure('2026-12-05T19:30:00.000Z')).toBe('20:30');
  });

  it('affiche un prix en euros', () => {
    expect(prix(10.5).replace(/\s/g, ' ')).toBe('10,50 €');
  });

  it('donne une date au format AAAA-MM-JJ', () => {
    expect(dateIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
