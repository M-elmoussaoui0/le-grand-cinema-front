/** Les horaires sont affichés dans le fuseau du cinéma, quel que soit le pays du téléphone. */
const FUSEAU = 'Europe/Paris';

export const heure = (date: string | Date, locale = 'fr-FR') =>
  new Date(date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: FUSEAU });

export const jour = (date: string | Date, locale = 'fr-FR') =>
  new Date(date).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: FUSEAU,
  });

export const jourCourt = (date: string | Date, locale = 'fr-FR') =>
  new Date(date).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', timeZone: FUSEAU });

export const prix = (montant: number, locale = 'fr-FR') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(montant);

/** Date au format AAAA-MM-JJ, dans le fuseau du cinéma, décalée de n jours. */
export function dateIso(decalageJours = 0): string {
  return new Date(Date.now() + decalageJours * 86_400_000).toLocaleDateString('sv-SE', { timeZone: FUSEAU });
}
