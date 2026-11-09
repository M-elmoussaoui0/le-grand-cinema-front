import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Plan } from '../api/types';
import { nomsPlaces } from '../pages/SeancePage';
import { afficher } from '../test-utils';
import { basculer, PLACES_MAX, PlanSalle } from './PlanSalle';

const plan: Plan = {
  seanceId: 1,
  placesRestantes: { enLigne: 2, guichet: 1, total: 3, complet: false },
  rangees: [
    {
      rangee: 'A',
      places: [
        { id: 1, numero: 1, type: 'pmr', statut: 'libre' },
        { id: 2, numero: 2, type: 'standard', statut: 'occupee' },
      ],
    },
    {
      rangee: 'B',
      places: [
        { id: 3, numero: 1, type: 'standard', statut: 'libre' },
        { id: 4, numero: 2, type: 'standard', statut: 'guichet' },
      ],
    },
  ],
};

function PlanAvecEtat() {
  const [selection, setSelection] = useState<number[]>([]);
  return (
    <>
      <PlanSalle plan={plan} selection={selection} onChange={setSelection} />
      <output>{nomsPlaces(plan, selection).join(',')}</output>
    </>
  );
}

describe('US3 – Choisir sa place sur un plan (front)', () => {
  it('ajoute puis retire une place de la sélection', () => {
    expect(basculer([], 5)).toEqual([5]);
    expect(basculer([5, 6], 5)).toEqual([6]);
  });

  it(`limite la sélection à ${PLACES_MAX} places`, () => {
    const pleine = Array.from({ length: PLACES_MAX }, (_, i) => i);
    expect(basculer(pleine, 99)).toEqual(pleine);
  });

  it('les places occupées et celles du guichet ne sont pas cliquables', () => {
    afficher(<PlanAvecEtat />);
    expect(screen.getByRole('button', { name: 'Rangée A, place 2' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Rangée B, place 2' })).toBeDisabled();
  });

  it('sélectionne des places et affiche leur nom', async () => {
    afficher(<PlanAvecEtat />);
    await userEvent.click(screen.getByRole('button', { name: 'Rangée A, place 1 (Place PMR)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Rangée B, place 1' }));
    expect(screen.getByRole('status', { hidden: true }) ?? screen.getByText('A1,B1')).toBeTruthy();
    expect(screen.getByText('A1,B1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rangée B, place 1' })).toHaveAttribute('aria-pressed', 'true');
  });
});
