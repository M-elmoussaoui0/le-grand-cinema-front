import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, envoyer, ErreurApi } from '../api/client';
import { Plan, ReservationCreee, Seance } from '../api/types';
import { useAuth } from '../auth/AuthContext';
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
  const { t, locale, messageErreur } = useI18n();
  const [selection, setSelection] = useState<number[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const { utilisateur } = useAuth();
  const navigate = useNavigate();
  const seance = useDonnees(() => api<Seance>(`/seances/${id}`), [id]);
  const plan = useDonnees(() => api<Plan>(`/seances/${id}/plan`), [id]);

  /**
   * US5 : la réservation est confirmée par l'API. Si un autre spectateur a pris une des places
   * entre-temps (erreur 409), on l'explique et on recharge le plan à jour.
   */
  async function reserver() {
    if (!utilisateur) return navigate('/connexion', { state: { retour: `/seances/${id}` } });
    setEnvoi(true);
    setErreur(null);
    try {
      const r = await envoyer<ReservationCreee>('/reservations', 'POST', {
        seanceId: Number(id),
        placeIds: selection,
      });
      navigate(`/reservations/${r.id}/paiement`, { state: r });
    } catch (e) {
      setErreur(messageErreur(e));
      if (e instanceof ErreurApi && e.statut === 409) {
        setSelection([]);
        await plan.recharger();
      }
    } finally {
      setEnvoi(false);
    }
  }

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

      {erreur && <MessageErreur message={erreur} />}
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
          <button className="bouton" disabled={selection.length === 0 || envoi} onClick={reserver}>
            {t('plan.reserver')}
          </button>
        </div>
      )}
    </section>
  );
}
