import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afficher, simulerApi } from '../../test-utils';
import Scanner from './Scanner';

describe("US7 – Scanner un billet à l'entrée (front)", () => {
  afterEach(() => vi.restoreAllMocks());

  it('billet valide : écran vert avec les places, champ vidé pour le spectateur suivant', async () => {
    const fetch = simulerApi({
      'POST /billets/scan': {
        valide: true,
        message: 'Entrée autorisée : 2 place(s).',
        film: 'Nuit Blanche',
        salle: 'Salle 2',
        debut: '2026-12-05T19:30:00.000Z',
        places: ['C7', 'C8'],
      },
    });
    afficher(<Scanner />);
    // La douchette tape le code puis la touche Entrée
    await userEvent.type(screen.getByLabelText('Code du billet'), 'LGC-abc123{Enter}');
    const verdict = await screen.findByRole('status');
    expect(verdict).toHaveClass('ok');
    expect(verdict).toHaveTextContent('Entrée autorisée');
    expect(verdict).toHaveTextContent('C7, C8');
    expect(screen.getByLabelText('Code du billet')).toHaveValue('');
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual({ code: 'LGC-abc123' });
  });

  it("billet déjà utilisé : écran rouge avec le message de l'API", async () => {
    simulerApi({
      'POST /billets/scan': new Response(
        JSON.stringify({ statusCode: 409, message: 'Billet déjà utilisé à 20:12 : entrée refusée.' }),
        { status: 409 },
      ),
    });
    afficher(<Scanner />);
    await userEvent.type(screen.getByLabelText('Code du billet'), 'LGC-abc123{Enter}');
    const verdict = await screen.findByRole('status');
    expect(verdict).toHaveClass('refus');
    expect(verdict).toHaveTextContent('Billet déjà utilisé à 20:12');
  });

  it("n'envoie rien si le champ est vide", async () => {
    const fetch = simulerApi({});
    afficher(<Scanner />);
    await userEvent.click(screen.getByRole('button', { name: 'Vérifier le billet' }));
    expect(fetch).not.toHaveBeenCalled();
  });
});
