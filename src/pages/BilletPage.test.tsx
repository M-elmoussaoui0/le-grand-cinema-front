import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { afficher, simulerApi } from '../test-utils';
import BilletPage from './BilletPage';

const page = () =>
  afficher(
    <Routes>
      <Route path="/billets/:id" element={<BilletPage />} />
    </Routes>,
    { route: '/billets/42' },
  );

describe('US6 – Recevoir un billet QR code (front)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('affiche le QR code et les informations du billet', async () => {
    simulerApi({
      '/reservations/42/billet': {
        reservationId: 42,
        codeBillet: 'LGC-abc123',
        qrCode: 'data:image/png;base64,AAAA',
        film: 'Nuit Blanche',
        salle: 'Salle 2',
        debut: '2026-12-05T19:30:00.000Z',
        langue: 'VOST',
        places: ['C7', 'C8'],
        montantTotal: 21,
      },
    });
    page();
    expect(await screen.findByRole('img', { name: 'QR code du billet LGC-abc123' })).toHaveAttribute(
      'src',
      'data:image/png;base64,AAAA',
    );
    expect(screen.getByText('C7, C8')).toBeInTheDocument();
    expect(screen.getByText('20:30')).toBeInTheDocument();
  });

  it("affiche le message de l'API si le billet n'est pas encore payé", async () => {
    simulerApi({
      '/reservations/42/billet': new Response(
        JSON.stringify({ message: 'Le billet est disponible après le paiement.' }),
        { status: 400 },
      ),
    });
    page();
    expect(await screen.findByRole('alert')).toHaveTextContent('disponible après le paiement');
  });
});
