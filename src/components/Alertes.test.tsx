import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alerte } from '../api/types';
import { afficher, simulerApi } from '../test-utils';
import { Alertes, RAFRAICHISSEMENT_ALERTES_MS } from './Alertes';

const alerte = (seanceId: number, niveau: Alerte['niveau'] = 'attention'): Alerte => ({
  type: niveau === 'critique' ? 'pic_ventes' : 'presque_complet',
  niveau,
  seanceId,
  film: 'Nuit Blanche',
  salle: `Salle ${seanceId}`,
  debut: '2026-12-05T19:30:00.000Z',
  message: `Alerte séance ${seanceId}`,
});

describe('US12 – Être alerté en cas de pic (front)', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("n'affiche rien quand il n'y a pas d'alerte", async () => {
    const fetch = simulerApi({ '/admin/alertes': [] });
    const { container } = afficher(<Alertes />);
    await vi.waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('affiche une nouvelle alerte dès le rafraîchissement suivant (30 secondes)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let appels = 0;
    simulerApi({ '/admin/alertes': () => (++appels === 1 ? [] : [alerte(4, 'critique')]) });
    afficher(<Alertes />);
    await act(() => vi.advanceTimersByTimeAsync(RAFRAICHISSEMENT_ALERTES_MS));
    expect(await screen.findByText('Alerte séance 4')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Suivre' })).toHaveAttribute('href', '/admin/direct?seance=4');
  });

  it('limite à 3 alertes visibles et permet de tout afficher', async () => {
    simulerApi({ '/admin/alertes': [1, 2, 3, 4, 5].map((id) => alerte(id)) });
    afficher(<Alertes />);
    expect(await screen.findAllByRole('listitem')).toHaveLength(3);
    await userEvent.click(screen.getByRole('button', { name: 'Voir les 5 alertes' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });
});
