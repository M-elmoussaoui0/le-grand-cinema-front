import { screen } from '@testing-library/react';
import App from './App';
import { afficher } from './test-utils';

describe('application', () => {
  it('affiche une page introuvable pour une adresse inconnue', () => {
    afficher(<App />, { route: '/nimporte-quoi' });
    expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeInTheDocument();
  });
});
