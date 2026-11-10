import { screen } from '@testing-library/react';
import { afficher } from '../test-utils';
import { PlacesRestantes } from './PlacesRestantes';

describe('US2 – Voir les places restantes (front)', () => {
  it('affiche le nombre de places restantes en ligne', () => {
    afficher(<PlacesRestantes places={{ enLigne: 120, guichet: 30, total: 150, complet: false }} />);
    expect(screen.getByText('120 places')).toBeInTheDocument();
  });

  it('prévient quand il reste peu de places', () => {
    afficher(<PlacesRestantes places={{ enLigne: 7, guichet: 30, total: 37, complet: false }} />);
    expect(screen.getByText('Plus que 7 places')).toBeInTheDocument();
  });

  it('affiche « Complet » quand il ne reste plus de place en ligne', () => {
    afficher(<PlacesRestantes places={{ enLigne: 0, guichet: 12, total: 12, complet: true }} />);
    expect(screen.getByText('Complet')).toBeInTheDocument();
  });
});
