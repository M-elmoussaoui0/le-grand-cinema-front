import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Film, Seance } from '../api/types';
import { Chargement, MessageErreur } from '../components/Etat';
import { PlacesRestantes } from '../components/PlacesRestantes';
import { useI18n } from '../i18n/I18nContext';
import { dateIso, heure, jourCourt } from '../utils/format';
import { useDonnees } from '../utils/useDonnees';

const JOURS_AFFICHES = 7;

/** Regroupe les séances par film, dans l'ordre de la première séance. */
export function grouperParFilm(seances: Seance[]): { film: Film; seances: Seance[] }[] {
  const groupes = new Map<number, { film: Film; seances: Seance[] }>();
  for (const s of seances) {
    if (!groupes.has(s.film.id)) groupes.set(s.film.id, { film: s.film, seances: [] });
    groupes.get(s.film.id)!.seances.push(s);
  }
  return [...groupes.values()];
}

/** US1 : programmation consultable sans compte. */
export default function Programmation() {
  const { t, locale } = useI18n();
  const [date, setDate] = useState(dateIso());
  const [langue, setLangue] = useState<'' | 'VF' | 'VOST'>('');
  const { donnees, erreur, chargement, recharger } = useDonnees(
    () => api<Seance[]>(`/seances?date=${date}${langue ? `&langue=${langue}` : ''}`),
    [date, langue],
  );

  return (
    <section>
      <h1>{t('programme.titre')}</h1>

      <div className="defilement" role="tablist" aria-label={t('programme.choixJour')}>
        {Array.from({ length: JOURS_AFFICHES }, (_, i) => dateIso(i)).map((d, i) => (
          <button
            key={d}
            role="tab"
            aria-selected={d === date}
            className={`jour ${d === date ? 'actif' : ''}`}
            onClick={() => setDate(d)}
          >
            {i === 0 ? t('programme.aujourdhui') : jourCourt(`${d}T12:00:00`, locale)}
          </button>
        ))}
      </div>

      <div className="ligne" style={{ margin: '12px 0 20px' }}>
        {(['', 'VF', 'VOST'] as const).map((l) => (
          <button
            key={l || 'toutes'}
            className={`bouton petit ${langue === l ? '' : 'secondaire'}`}
            aria-pressed={langue === l}
            onClick={() => setLangue(l)}
          >
            {l || t('programme.toutesLangues')}
          </button>
        ))}
      </div>

      {chargement && <Chargement />}
      {erreur && <MessageErreur message={erreur} onReessayer={recharger} />}
      {donnees && donnees.length === 0 && <p className="doux">{t('programme.aucuneSeance')}</p>}

      <div className="pile">
        {donnees &&
          grouperParFilm(donnees).map(({ film, seances }) => (
            <article key={film.id} className="carte film">
              <div className="ligne espace">
                <h2 style={{ margin: 0 }}>{film.titre}</h2>
                {film.classification && <span className="puce">{film.classification}</span>}
              </div>
              <p className="doux petit" style={{ margin: '4px 0 8px' }}>
                {[film.genre, t('programme.duree', { minutes: film.dureeMinutes })]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {film.synopsis && <p style={{ margin: '0 0 12px' }}>{film.synopsis}</p>}
              <ul className="horaires">
                {seances.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/seances/${s.id}`}
                      className={`horaire ${s.placesRestantes?.complet ? 'complet' : ''}`}
                      aria-disabled={s.placesRestantes?.complet}
                    >
                      <strong>{heure(s.debut, locale)}</strong>
                      <span className="petit doux">
                        {s.salle.nom} · {s.langue}
                      </span>
                      <PlacesRestantes places={s.placesRestantes} />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
      </div>
    </section>
  );
}
