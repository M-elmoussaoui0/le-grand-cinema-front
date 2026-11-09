import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { jetonStocke } from '../api/client';
import { RouteProtegee } from '../auth/RouteProtegee';
import { afficher, simulerApi } from '../test-utils';
import Connexion from './Connexion';
import { motDePasseValide } from './Inscription';

const utilisateur = { id: 2, nom: 'Martin', prenom: 'Léa', email: 'client@legrandcinema.fr', role: 'client' };

describe('US16 – Protéger les données (front)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('connecte le client et enregistre le jeton', async () => {
    simulerApi({ 'POST /auth/connexion': { accessToken: 'jeton-123', utilisateur } });
    afficher(
      <Routes>
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/" element={<p>Accueil</p>} />
      </Routes>,
      { route: '/connexion' },
    );
    await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'client@legrandcinema.fr');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'Demo2026!');
    await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByText('Accueil')).toBeInTheDocument();
    expect(jetonStocke.lire()).toBe('jeton-123');
  });

  it("affiche le message de l'API en cas d'erreur", async () => {
    simulerApi({
      'POST /auth/connexion': new Response(JSON.stringify({ message: 'E-mail ou mot de passe incorrect.' }), {
        status: 401,
      }),
    });
    afficher(<Connexion />, { route: '/connexion' });
    await userEvent.type(screen.getByLabelText('Adresse e-mail'), 'x@y.fr');
    await userEvent.type(screen.getByLabelText('Mot de passe'), 'mauvais');
    await userEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou mot de passe incorrect.');
  });

  it('redirige vers la connexion un visiteur non connecté', async () => {
    afficher(
      <Routes>
        <Route path="/compte" element={<RouteProtegee>Secret</RouteProtegee>} />
        <Route path="/connexion" element={<p>Page de connexion</p>} />
      </Routes>,
      { route: '/compte' },
    );
    expect(await screen.findByText('Page de connexion')).toBeInTheDocument();
  });

  it("refuse un écran d'administration à un client", async () => {
    jetonStocke.ecrire('jeton-client');
    simulerApi({ '/auth/moi': utilisateur });
    afficher(
      <Routes>
        <Route path="/admin" element={<RouteProtegee role="admin">Gestion</RouteProtegee>} />
        <Route path="/" element={<p>Accueil</p>} />
      </Routes>,
      { route: '/admin' },
    );
    await waitFor(() => expect(screen.getByText('Accueil')).toBeInTheDocument());
  });

  it('vérifie la robustesse du mot de passe comme l’API', () => {
    expect(motDePasseValide('abc')).toBe(false);
    expect(motDePasseValide('motdepasse2026')).toBe(false);
    expect(motDePasseValide('MotDePasse2026')).toBe(true);
  });
});
