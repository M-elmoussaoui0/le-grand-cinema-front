import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afficher, simulerApi } from '../../test-utils';
import Guichet from './Guichet';

const seance = {
  id: 12,
  debut: '2026-12-05T19:30:00.000Z',
  fin: '2026-12-05T21:30:00.000Z',
  prix: 10.5,
  langue: 'VF',
  film: { id: 1, titre: 'Nuit Blanche' },
  salle: { id: 2, nom: 'Salle 2', capacite: 250 },
  placesRestantes: { enLigne: 140, guichet: 25, total: 165, complet: false },
};

describe('US9 – Réserver un quota au guichet (front)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('affiche les places guichet restantes et vend des billets', async () => {
    const fetch = simulerApi({
      '/seances/12': seance,
      '/seances?': [seance],
      'POST /admin/guichet/ventes': { codeBillet: 'LGC-guichet', montantTotal: 21, places: ['M20', 'M19'] },
    });
    afficher(<Guichet />, { route: '/admin/guichet?seance=12' });
    expect(await screen.findByText('25')).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('Nombre de billets'));
    await userEvent.type(screen.getByLabelText('Nombre de billets'), '2');
    await userEvent.click(screen.getByRole('button', { name: /Encaisser 21,00/ }));
    expect(await screen.findByText('Billets vendus : places M20, M19.')).toBeInTheDocument();
    const envoi = fetch.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(String(envoi?.[1]?.body))).toEqual({ seanceId: 12, nombre: 2 });
  });

  it('modifie le quota de places gardées', async () => {
    const fetch = simulerApi({
      '/seances/12': seance,
      '/seances?': [seance],
      'PATCH /admin/seances/12/quota': { seanceId: 12, quotaGuichet: 40 },
    });
    afficher(<Guichet />, { route: '/admin/guichet?seance=12' });
    await userEvent.type(await screen.findByLabelText('Nombre de places gardées'), '40');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer le quota' }));
    expect(await screen.findByRole('status')).toHaveTextContent('40 places gardées');
    expect(fetch.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(true);
  });
});
