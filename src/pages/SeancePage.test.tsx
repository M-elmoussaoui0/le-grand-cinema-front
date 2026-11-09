import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { jetonStocke } from '../api/client';
import { afficher, simulerApi } from '../test-utils';
import SeancePage from './SeancePage';

const seance = {
  id: 7,
  debut: '2026-12-05T19:30:00.000Z',
  fin: '2026-12-05T21:45:00.000Z',
  prix: 10.5,
  langue: 'VF',
  film: {
    id: 1,
    titre: 'Le Dernier Accord',
    synopsis: null,
    dureeMinutes: 118,
    genre: 'Drame',
    classification: null,
  },
  salle: { id: 1, nom: 'Salle 1', capacite: 300 },
};
const plan = (statutA1: string) => ({
  seanceId: 7,
  placesRestantes: { enLigne: 2, guichet: 0, total: 2, complet: false },
  rangees: [
    {
      rangee: 'A',
      places: [
        { id: 1, numero: 1, type: 'standard', statut: statutA1 },
        { id: 2, numero: 2, type: 'standard', statut: 'libre' },
      ],
    },
  ],
});
const utilisateur = { id: 2, nom: 'Martin', prenom: 'Léa', email: 'client@legrandcinema.fr', role: 'client' };

function page() {
  return afficher(
    <Routes>
      <Route path="/seances/:id" element={<SeancePage />} />
      <Route path="/reservations/:id/paiement" element={<p>Page de paiement</p>} />
      <Route path="/connexion" element={<p>Page de connexion</p>} />
    </Routes>,
    { route: '/seances/7' },
  );
}

describe('US5 – Garantir une place unique (front)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('un visiteur non connecté est invité à se connecter avant de réserver', async () => {
    simulerApi({ '/seances/7/plan': plan('libre'), '/seances/7': seance });
    page();
    await userEvent.click(await screen.findByRole('button', { name: 'Rangée A, place 1' }));
    await userEvent.click(screen.getByRole('button', { name: 'Réserver' }));
    expect(await screen.findByText('Page de connexion')).toBeInTheDocument();
  });

  it('réserve les places choisies puis ouvre le paiement', async () => {
    jetonStocke.ecrire('jeton');
    const fetch = simulerApi({
      '/auth/moi': utilisateur,
      '/seances/7/plan': plan('libre'),
      '/seances/7': seance,
      'POST /reservations': { id: 42, seanceId: 7, statut: 'en_attente', montantTotal: 21, placeIds: [1, 2] },
    });
    page();
    await userEvent.click(await screen.findByRole('button', { name: 'Rangée A, place 1' }));
    await userEvent.click(screen.getByRole('button', { name: 'Rangée A, place 2' }));
    expect(screen.getByText('2 place(s) : A1, A2')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Réserver' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Réserver' }));
    expect(await screen.findByText('Page de paiement')).toBeInTheDocument();
    const envoi = fetch.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(String(envoi?.[1]?.body))).toEqual({ seanceId: 7, placeIds: [1, 2] });
  });

  it('place prise par un autre spectateur : message clair et plan rechargé', async () => {
    jetonStocke.ecrire('jeton');
    let appelsPlan = 0;
    simulerApi({
      '/auth/moi': utilisateur,
      '/seances/7/plan': () => plan(++appelsPlan === 1 ? 'libre' : 'occupee'),
      '/seances/7': seance,
      'POST /reservations': new Response(
        JSON.stringify({ message: "Une des places choisies vient d'être réservée par un autre spectateur." }),
        { status: 409 },
      ),
    });
    page();
    await userEvent.click(await screen.findByRole('button', { name: 'Rangée A, place 1' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Réserver' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Réserver' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('vient d');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Rangée A, place 1' })).toBeDisabled());
  });
});
