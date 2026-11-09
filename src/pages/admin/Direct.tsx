import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { Seance, SuiviDirect } from '../../api/types';
import { MessageErreur } from '../../components/Etat';
import { Jauge } from '../../components/Jauge';
import { useI18n } from '../../i18n/I18nContext';
import { dateIso, heure, pourcent, prix } from '../../utils/format';
import { useDonnees } from '../../utils/useDonnees';

/** Fréquence de rafraîchissement du suivi en direct. */
export const RAFRAICHISSEMENT_MS = 10_000;

/** US10 : suivi d'une séance en direct, rafraîchi toutes les 10 secondes. */
export default function Direct() {
  const { t, locale } = useI18n();
  const [params, setParams] = useSearchParams();
  const seanceId = params.get('seance') ?? '';
  const seances = useDonnees(() => api<Seance[]>(`/seances?date=${dateIso()}`), []);
  const suivi = useDonnees(
    () => (seanceId ? api<SuiviDirect>(`/admin/seances/${seanceId}/direct`) : Promise.resolve(null)),
    [seanceId],
    seanceId ? RAFRAICHISSEMENT_MS : undefined,
  );
  const d = suivi.donnees;

  return (
    <div className="pile">
      <h1 style={{ margin: 0 }}>{t('direct.titre')}</h1>
      <label>
        {t('guichet.seance')}
        <select value={seanceId} onChange={(e) => setParams({ seance: e.target.value })}>
          <option value="">—</option>
          {seances.donnees?.map((x) => (
            <option key={x.id} value={x.id}>
              {heure(x.debut, locale)} · {x.film.titre} · {x.salle.nom}
            </option>
          ))}
        </select>
      </label>
      {suivi.erreur && <MessageErreur message={suivi.erreur} />}

      {d && (
        <div className="carte pile">
          <div className="ligne espace">
            <strong>
              {d.film} · {d.salle} · {heure(d.debut, locale)}
            </strong>
            <span className="puce vert" aria-live="polite">
              ● {t('direct.enDirect', { heure: new Date(d.misAJourA).toLocaleTimeString(locale) })}
            </span>
          </div>
          <Jauge taux={d.tauxRemplissage} libelle={t('direct.remplissage')} />
          <p style={{ margin: 0 }}>
            <strong style={{ fontSize: '1.4rem' }}>{pourcent(d.tauxRemplissage, locale)}</strong>{' '}
            <span className="doux">
              {t('direct.surCapacite', { vendues: d.vendues.total, capacite: d.capacite })}
            </span>
          </p>
          <div className="chiffres">
            <div>
              <span className="chiffre">{d.vendues.enLigne}</span>
              <span className="doux petit">{t('direct.enLigne')}</span>
            </div>
            <div>
              <span className="chiffre">{d.vendues.guichet}</span>
              <span className="doux petit">{t('direct.guichet')}</span>
            </div>
            <div>
              <span className="chiffre">{d.enAttentePaiement}</span>
              <span className="doux petit">{t('direct.enAttente')}</span>
            </div>
            {d.entrees !== undefined && (
              <div>
                <span className="chiffre">{d.entrees}</span>
                <span className="doux petit">{t('direct.entrees')}</span>
              </div>
            )}
            <div>
              <span className="chiffre">{d.restantes}</span>
              <span className="doux petit">{t('direct.restantes')}</span>
            </div>
            <div>
              <span className="chiffre">{d.ventesDerniereHeure}</span>
              <span className="doux petit">{t('direct.derniereHeure')}</span>
            </div>
            <div>
              <span className="chiffre">{prix(d.recettes, locale)}</span>
              <span className="doux petit">{t('direct.recettes')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
