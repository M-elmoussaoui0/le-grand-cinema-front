import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afficher, simulerApi } from '../../test-utils';
import Seances from './Seances';

const reponses = (creation: unknown) => ({
  '/films': [{ id: 1, titre: 'Le Dernier Accord', dureeMinutes: 118 }],
  '/admin/salles': [{ id: 3, nom: 'Salle 3', capacite: 200 }],
  'POST /admin/seances': creation,
  '/seances': [],
});

async function remplir() {
  await userEvent.selectOptions(await screen.findByLabelText('Film'), '1');
  await userEvent.selectOptions(screen.getByLabelText('Salle'), '3');
  await userEvent.clear(screen.getByLabelText('Heure de début'));
  await userEvent.type(screen.getByLabelText('Heure de début'), '22:45');
  await userEvent.click(screen.getByRole('button', { name: 'Créer la séance' }));
}

describe('US8 – Créer une séance (front)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('envoie la séance à l’API et affiche l’heure de fin calculée', async () => {
    const fetch = simulerApi(reponses({ id: 99, fin: '2026-12-06T00:58:00.000Z' }));
    afficher(<Seances />);
    await remplir();
    expect(await screen.findByRole('status')).toHaveTextContent('Fin prévue à 01:58');
    const envoi = fetch.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(JSON.parse(String(envoi?.[1]?.body))).toMatchObject({
      filmId: 1,
      salleId: 3,
      prix: 9.5,
      langue: 'VF',
    });
  });

  it('affiche le refus de l’API en cas de chevauchement', async () => {
    simulerApi(
      reponses(
        new Response(
          JSON.stringify({ message: 'Ce créneau chevauche une autre séance dans la même salle.' }),
          {
            status: 409,
          },
        ),
      ),
    );
    afficher(<Seances />);
    await remplir();
    expect(await screen.findByRole('alert')).toHaveTextContent('chevauche');
  });
});
