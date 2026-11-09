import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Remplissage } from '../../api/types';
import { Chargement, MessageErreur } from '../../components/Etat';
import { Jauge } from '../../components/Jauge';
import { useI18n } from '../../i18n/I18nContext';
import { dateIso, heure, pourcent, prix } from '../../utils/format';
import { useDonnees } from '../../utils/useDonnees';

/** US11 : taux de remplissage du jour, par film et par séance. */
export default function TableauDeBord() {
  const { t, locale } = useI18n();
  const [date, setDate] = useState(dateIso());
  const {
    donnees: r,
    erreur,
    chargement,
  } = useDonnees(() => api<Remplissage>(`/admin/remplissage?date=${date}`), [date]);

  return (
    <div className="pile">
      <div className="ligne espace">
        <h1 style={{ margin: 0 }}>{t('tableau.titre')}</h1>
        <label style={{ minWidth: 180 }}>
          <span className="sr-only">{t('admin.date')}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label={t('admin.date')}
          />
        </label>
      </div>
      {chargement && <Chargement />}
      {erreur && <MessageErreur message={erreur} />}
      {r && (
        <>
          <div className="chiffres">
            <div>
              <span className="chiffre">{pourcent(r.resume.tauxRemplissage, locale)}</span>
              <span className="doux petit">{t('tableau.tauxJour')}</span>
            </div>
            <div>
              <span className="chiffre">{r.resume.placesVendues}</span>
              <span className="doux petit">
                {t('tableau.placesVendues', { capacite: r.resume.capacite })}
              </span>
            </div>
            <div>
              <span className="chiffre">{r.resume.seances}</span>
              <span className="doux petit">{t('tableau.seances')}</span>
            </div>
            <div>
              <span className="chiffre">{prix(r.resume.recettes, locale)}</span>
              <span className="doux petit">{t('direct.recettes')}</span>
            </div>
          </div>

          <h2>{t('tableau.parFilm')}</h2>
          <div className="carte pile">
            {r.parFilm.map((f) => (
              <div key={f.film} className="pile" style={{ gap: 4 }}>
                <div className="ligne espace">
                  <span>{f.film}</span>
                  <strong>{pourcent(f.tauxRemplissage, locale)}</strong>
                </div>
                <Jauge
                  taux={f.tauxRemplissage}
                  libelle={`${f.film} : ${pourcent(f.tauxRemplissage, locale)}`}
                />
              </div>
            ))}
          </div>

          <h2>{t('tableau.parSeance')}</h2>
          <div className="tableau-defilement">
            <table className="tableau">
              <thead>
                <tr>
                  <th>{t('admin.heure')}</th>
                  <th>{t('admin.film')}</th>
                  <th>{t('admin.salle')}</th>
                  <th>{t('tableau.vendues')}</th>
                  <th>{t('tableau.taux')}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {r.seances.map((s) => (
                  <tr key={s.seanceId}>
                    <td>{heure(s.debut, locale)}</td>
                    <td>{s.film}</td>
                    <td>{s.salle}</td>
                    <td>
                      {s.vendues}/{s.capacite}
                    </td>
                    <td className={s.tauxRemplissage >= 90 ? 'fort' : ''}>
                      {pourcent(s.tauxRemplissage, locale)}
                    </td>
                    <td>
                      <Link to={`/admin/direct?seance=${s.seanceId}`}>{t('tableau.suivre')}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
