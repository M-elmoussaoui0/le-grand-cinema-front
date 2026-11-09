import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Plan, Seance } from '../api/types';
import { Chargement, MessageErreur } from '../components/Etat';
import { PLACES_MAX, PlanSalle } from '../components/PlanSalle';
import { useI18n } from '../i18n/I18nContext';
import { heure, jour, prix } from '../utils/format';
import { useDonnees } from '../utils/useDonnees';

/** Nom lisible des places choisies, par exemple « C7, C8 ». */
export function nomsPlaces(plan: Plan, selection: number[]): string[] {
  return plan.rangees.flatMap(({ rangee, places }) =>
    places.filter((p) => selection.includes(p.id)).map((p) => `${rangee}${p.numero}`),
  );
}

export default function SeancePage() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const [selection, setSelection] = useState<number[]>([]);
  const seance = useDonnees(() => api<Seance>(`/seances/${id}`), [id]);
  const plan = useDonnees(() => api<Plan>(`/seances/${id}/plan`), [id]);

  if (seance.chargement || plan.chargement) return <Chargement />;
  if (seance.erreur || !seance.donnees)
    return <MessageErreur message={seance.erreur ?? t('commun.erreur')} />;
  const s = seance.donnees;

  return (
    <section className="pile">
      <div>
        <h1 style={{ marginBottom: 4 }}>{s.film.titre}</h1>
        <p className="doux" style={{ margin: 0, textTransform: 'capitalize' }}>
          {jour(s.debut, locale)} · {heure(s.debut, locale)} · {s.salle.nom} · {s.langue} ·{' '}
          {prix(s.prix, locale)}
        </p>
      </div>

      {plan.erreur && <MessageErreur message={plan.erreur} onReessayer={plan.recharger} />}
      {plan.donnees && <PlanSalle plan={plan.donnees} selection={selection} onChange={setSelection} />}

      {plan.donnees && (
        <div className="barre-action">
          <div>
            <strong>
              {selection.length === 0
                ? t('plan.aucunePlace')
                : t('plan.selection', {
                    n: selection.length,
                    places: nomsPlaces(plan.donnees, selection).join(', '),
                  })}
            </strong>
            <div className="doux petit">
              {selection.length === PLACES_MAX
                ? t('plan.maximum', { max: PLACES_MAX })
                : prix(selection.length * s.prix, locale)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
