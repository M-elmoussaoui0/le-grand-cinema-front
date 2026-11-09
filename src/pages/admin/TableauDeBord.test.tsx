import { screen } from '@testing-library/react';
import { afficher, simulerApi } from '../../test-utils';
import TableauDeBord from './TableauDeBord';

describe('US11 – Voir le taux de remplissage (front)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('affiche le taux du jour, par film et par séance', async () => {
    simulerApi({
      '/admin/remplissage': {
        jour: '2026-12-05',
        resume: { seances: 2, placesVendues: 230, capacite: 400, tauxRemplissage: 57.5, recettes: 2210 },
        parFilm: [
          { film: 'Nuit Blanche', vendues: 230, capacite: 400, recettes: 2210, tauxRemplissage: 57.5 },
        ],
        seances: [
          {
            seanceId: 1,
            film: 'Nuit Blanche',
            salle: 'Salle 3',
            debut: '2026-12-05T13:00:00.000Z',
            capacite: 200,
            vendues: 40,
            tauxRemplissage: 20,
            recettes: 340,
          },
          {
            seanceId: 2,
            film: 'Nuit Blanche',
            salle: 'Salle 4',
            debut: '2026-12-05T19:30:00.000Z',
            capacite: 200,
            vendues: 190,
            tauxRemplissage: 95,
            recettes: 1870,
          },
        ],
      },
    });
    afficher(<TableauDeBord />);
    expect(await screen.findByText('57.5 %', { selector: '.chiffre' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Nuit Blanche : 57.5 %' })).toBeInTheDocument();
    expect(screen.getByText('95 %')).toHaveClass('fort');
    expect(screen.getAllByRole('link', { name: 'Suivre' })[1]).toHaveAttribute(
      'href',
      '/admin/direct?seance=2',
    );
  });
});
