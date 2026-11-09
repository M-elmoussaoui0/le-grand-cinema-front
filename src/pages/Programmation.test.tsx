import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Seance } from '../api/types';
import { afficher, simulerApi } from '../test-utils';
import Programmation, { grouperParFilm } from './Programmation';

const film = (id: number, titre: string) => ({
  id,
  titre,
  synopsis: null,
  dureeMinutes: 104,
  genre: 'Thriller',
  classification: '-12',
});
const seance = (
  id: number,
  f: ReturnType<typeof film>,
  debut: string,
  langue: 'VF' | 'VOST' = 'VF',
): Seance => ({
  id,
  debut,
  fin: debut,
  prix: 8.5,
  langue,
  film: f,
  salle: { id: 1, nom: 'Salle 1', capacite: 300 },
});
const nuit = film(2, 'Nuit Blanche');
const orbite = film(5, 'Orbite Basse');
const seances = [
  seance(1, nuit, '2026-12-05T13:00:00.000Z'),
  seance(2, orbite, '2026-12-05T13:00:00.000Z'),
  seance(3, nuit, '2026-12-05T19:30:00.000Z', 'VOST'),
];

describe('US1 – Voir les séances sans compte (front)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('regroupe les séances par film', () => {
    const groupes = grouperParFilm(seances);
    expect(groupes.map((g) => g.film.titre)).toEqual(['Nuit Blanche', 'Orbite Basse']);
    expect(groupes[0].seances).toHaveLength(2);
  });

  it('affiche la programmation sans être connecté', async () => {
    simulerApi({ '/seances': seances });
    afficher(<Programmation />);
    expect(await screen.findByRole('heading', { name: 'Nuit Blanche' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /20:30/ })).toHaveAttribute('href', '/seances/3');
  });

  it('filtre par langue en interrogeant l’API', async () => {
    const fetch = simulerApi({ '/seances': seances });
    afficher(<Programmation />);
    await screen.findByRole('heading', { name: 'Nuit Blanche' });
    await userEvent.click(screen.getByRole('button', { name: 'VOST' }));
    expect(String(fetch.mock.calls.at(-1)?.[0])).toContain('langue=VOST');
  });

  it('indique quand il n’y a aucune séance', async () => {
    simulerApi({ '/seances': [] });
    afficher(<Programmation />);
    expect(await screen.findByText('Aucune séance ce jour-là.')).toBeInTheDocument();
  });
});
