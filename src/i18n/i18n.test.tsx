import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErreurApi } from '../api/client';
import { Entete } from '../components/Entete';
import { afficher, simulerApi } from '../test-utils';
import Programmation from '../pages/Programmation';
import { pourcent } from '../utils/format';
import { en } from './en';
import { fr } from './fr';
import { langueInitiale, useI18n } from './I18nContext';

function Erreur({ e }: { e: unknown }) {
  return <p>{useI18n().messageErreur(e)}</p>;
}

describe('US14 – Réserver en anglais', () => {
  afterEach(() => vi.restoreAllMocks());

  it('chaque texte français a sa traduction anglaise', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
    expect(Object.values(en).every((texte) => texte.trim().length > 0)).toBe(true);
  });

  it('les variables {n}, {montant}… sont les mêmes dans les deux langues', () => {
    const variables = (texte: string) => (texte.match(/\{\w+\}/g) ?? []).sort();
    for (const cle of Object.keys(fr) as (keyof typeof fr)[]) {
      expect([cle, variables(en[cle])]).toEqual([cle, variables(fr[cle])]);
    }
  });

  it('un visiteur dont le téléphone est en anglais voit le site en anglais', () => {
    localStorage.removeItem('lgc.langue');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    expect(langueInitiale()).toBe('en');
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');
    expect(langueInitiale()).toBe('fr');
  });

  it('le bouton EN traduit toute la page et mémorise le choix', async () => {
    simulerApi({ '/seances': [] });
    afficher(
      <>
        <Entete />
        <Programmation />
      </>,
    );
    expect(await screen.findByRole('heading', { name: 'À l’affiche' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /EN/ }));
    expect(screen.getByRole('heading', { name: 'Now showing' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Showtimes' })).toBeInTheDocument();
    expect(await screen.findByText('No showtimes on this day.')).toBeInTheDocument();
    expect(localStorage.getItem('lgc.langue')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it("traduit les erreurs de l'API pour un spectateur anglophone", async () => {
    localStorage.setItem('lgc.langue', 'en');
    afficher(<Erreur e={new ErreurApi(409, 'Une des places choisies est déjà réservée.')} />);
    expect(screen.getByText(/has just been booked by someone else/)).toBeInTheDocument();
  });

  it('formate les pourcentages selon la langue', () => {
    expect(pourcent(57.5, 'fr-FR')).toBe('57,5 %');
    expect(pourcent(57.5, 'en-GB')).toBe('57.5%');
  });
});
