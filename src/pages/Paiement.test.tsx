import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { I18nProvider } from '../i18n/I18nContext';
import { simulerApi } from '../test-utils';
import Paiement, { tempsRestant } from './Paiement';

function page() {
  const reservation = {
    id: 42,
    seanceId: 7,
    statut: 'en_attente',
    montantTotal: 21,
    placeIds: [1, 2],
    payerAvant: new Date(Date.now() + 10 * 60_000).toISOString(),
  };
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={[{ pathname: '/reservations/42/paiement', state: reservation }]}>
        <Routes>
          <Route path="/reservations/:id/paiement" element={<Paiement />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
}

describe('US4 – Réserver et payer sur mobile (front)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('affiche le temps restant avant la libération des places', () => {
    expect(tempsRestant('2026-12-05T20:15:00.000Z', Date.parse('2026-12-05T20:00:30.000Z'))).toBe('14:30');
    expect(tempsRestant('2026-12-05T20:15:00.000Z', Date.parse('2026-12-05T20:16:00.000Z'))).toBeNull();
  });

  it('paie avec Apple Pay en un clic', async () => {
    const fetch = simulerApi({
      'POST /reservations/42/paiement': { statut: 'payee', codeBillet: 'LGC-abc' },
    });
    page();
    await userEvent.click(screen.getByRole('button', { name: /Payer 21,00/ }));
    expect(await screen.findByRole('heading', { name: 'Paiement accepté' })).toBeInTheDocument();
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({
      moyen: 'apple_pay',
      jetonPaiement: 'tok_visa',
    });
  });

  it('carte refusée : le message de la banque est affiché et on peut réessayer', async () => {
    simulerApi({
      'POST /reservations/42/paiement': new Response(
        JSON.stringify({ message: 'Paiement refusé par la banque. Essayez un autre moyen de paiement.' }),
        { status: 402 },
      ),
    });
    page();
    await userEvent.click(screen.getByLabelText('Carte bancaire'));
    await userEvent.selectOptions(screen.getByLabelText(/Carte de test/), 'tok_chargeDeclined');
    await userEvent.click(screen.getByRole('button', { name: /Payer/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Paiement refusé par la banque');
    expect(screen.getByRole('button', { name: /Payer/ })).toBeEnabled();
  });
});
