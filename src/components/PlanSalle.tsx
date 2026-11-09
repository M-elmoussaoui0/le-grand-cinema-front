import { Plan } from '../api/types';
import { useI18n } from '../i18n/I18nContext';

export const PLACES_MAX = 10;

/** Ajoute ou retire une place de la sélection, dans la limite de 10 places. */
export function basculer(selection: number[], placeId: number): number[] {
  if (selection.includes(placeId)) return selection.filter((id) => id !== placeId);
  if (selection.length >= PLACES_MAX) return selection;
  return [...selection, placeId];
}

interface Props {
  plan: Plan;
  selection: number[];
  onChange: (selection: number[]) => void;
}

/** US3 : plan de la salle, chaque place est un bouton accessible au clavier et au lecteur d'écran. */
export function PlanSalle({ plan, selection, onChange }: Props) {
  const { t } = useI18n();
  return (
    <div className="plan">
      <div className="ecran" aria-hidden>
        {t('plan.ecran')}
      </div>
      <div className="plan-defilement">
        <div className="plan-grille" role="group" aria-label={t('plan.titre')}>
          {plan.rangees.map(({ rangee, places }) => (
            <div className="rangee" key={rangee}>
              <span className="rangee-nom">{rangee}</span>
              {places.map((p) => {
                const choisie = selection.includes(p.id);
                const libre = p.statut === 'libre';
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`place ${p.statut} ${p.type} ${choisie ? 'choisie' : ''}`}
                    disabled={!libre}
                    aria-pressed={choisie}
                    aria-label={
                      t('plan.place', { rangee, numero: p.numero }) +
                      (p.type === 'pmr' ? ` (${t('plan.pmr')})` : '')
                    }
                    title={`${rangee}${p.numero}`}
                    onClick={() => onChange(basculer(selection, p.id))}
                  >
                    {p.type === 'pmr' ? '♿' : ''}
                  </button>
                );
              })}
              <span className="rangee-nom">{rangee}</span>
            </div>
          ))}
        </div>
      </div>
      <ul className="legende">
        <li>
          <span className="place libre" /> {t('plan.libre')}
        </li>
        <li>
          <span className="place choisie" /> {t('plan.choisie')}
        </li>
        <li>
          <span className="place occupee" /> {t('plan.occupee')}
        </li>
        <li>
          <span className="place guichet" /> {t('plan.guichet')}
        </li>
        <li>
          <span className="place libre pmr">♿</span> {t('plan.pmr')}
        </li>
      </ul>
    </div>
  );
}
