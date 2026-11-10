import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MaReservation } from '../api/types';
import { afficher, simulerApi } from '../test-utils';
import MesReservations, { separer } from './MesReservations';

const resa = (id: number, debut: string, statut: MaReservation['statut'] = 'payee'): MaReservation => ({
  id,
  statut,
  montantTotal: 21,
  codeBillet: statut === 'payee' ? `LGC-${id}` : null,
  seanceId: 1,
  debut,
  langue: 'VF',
  film: `Film ${id}`,
  salle: 'Salle 1',
  places: ['A1', 'A2'],
  annulable: statut !== 'annulee',
});

describe('US13 – Retrouver ses réservations (front)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sépare les séances à venir des séances passées', () => {
    const maintenant = Date.parse('2026-12-05T12:00:00Z');
    const { aVenir, passees } = separer(
      [resa(3, '2026-12-09T19:00:00Z'), resa(2, '2026-12-06T19:00:00Z'), resa(1, '2026-12-01T19:00:00Z')],
      maintenant,
    );
    expect(aVenir.map((r) => r.id)).toEqual([2, 3]);
    expect(passees.map((r) => r.id)).toEqual([1]);
  });

  it('affiche le lien vers le billet d’une réservation payée', async () => {
    simulerApi({ '/reservations/moi': [resa(5, '2099-01-01T19:00:00Z')] });
    afficher(<MesReservations />);
    expect(await screen.findByRole('link', { name: 'Voir le billet' })).toHaveAttribute('href', '/billets/5');
  });

  it('annule après confirmation et recharge la liste', async () => {
    let annulee = false;
    simulerApi({
      'DELETE /reservations/5': () => {
        annulee = true;
        return { message: 'Réservation annulée, vous allez être remboursé.' };
      },
      '/reservations/moi': () => [resa(5, '2099-01-01T19:00:00Z', annulee ? 'annulee' : 'payee')],
    });
    afficher(<MesReservations />);
    await userEvent.click(await screen.findByRole('button', { name: 'Annuler' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmer l’annulation' }));
    expect(await screen.findByRole('status')).toHaveTextContent('vous allez être remboursé');
    expect(await screen.findByText('Annulée')).toBeInTheDocument();
  });
});
