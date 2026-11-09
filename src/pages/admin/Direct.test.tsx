import { act, screen } from '@testing-library/react';
import { afficher, simulerApi } from '../../test-utils';
import Direct, { RAFRAICHISSEMENT_MS } from './Direct';

const suivi = (enLigne: number) => ({
  seanceId: 12,
  film: 'Nuit Blanche',
  salle: 'Salle 2',
  debut: '2026-12-05T19:30:00.000Z',
  capacite: 250,
  vendues: { enLigne, guichet: 20, total: enLigne + 20 },
  enAttentePaiement: 4,
  restantes: 250 - enLigne - 24,
  tauxRemplissage: Math.round(((enLigne + 20) / 250) * 1000) / 10,
  ventesDerniereHeure: 12,
  recettes: 1890,
  misAJourA: new Date().toISOString(),
});

describe('US10 – Suivre une séance en direct (front)', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('affiche les ventes et se met à jour toutes les 10 secondes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let appels = 0;
    simulerApi({ '/admin/seances/12/direct': () => suivi(++appels === 1 ? 160 : 175), '/seances?': [] });
    afficher(<Direct />, { route: '/admin/direct?seance=12' });

    expect(await screen.findByText('160')).toBeInTheDocument();
    expect(screen.getByText('72 %')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Taux de remplissage' })).toHaveAttribute(
      'aria-valuenow',
      '72',
    );

    await act(() => vi.advanceTimersByTimeAsync(RAFRAICHISSEMENT_MS));
    expect(await screen.findByText('175')).toBeInTheDocument();
  });
});
