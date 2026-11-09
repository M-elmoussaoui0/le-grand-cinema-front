import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Alerte } from '../api/types';
import { useI18n } from '../i18n/I18nContext';
import { heure } from '../utils/format';
import { useDonnees } from '../utils/useDonnees';

export const RAFRAICHISSEMENT_ALERTES_MS = 30_000;
const VISIBLES = 3;

/**
 * US12 : bandeau d'alertes affiché sur tous les écrans de gestion,
 * interrogé toutes les 30 secondes. Les alertes critiques passent en premier.
 */
export function Alertes() {
  const { t, locale } = useI18n();
  const [tout, setTout] = useState(false);
  const { donnees } = useDonnees(() => api<Alerte[]>('/admin/alertes'), [], RAFRAICHISSEMENT_ALERTES_MS);
  if (!donnees || donnees.length === 0) return null;
  const affichees = tout ? donnees : donnees.slice(0, VISIBLES);

  return (
    <section className="alertes" aria-live="polite" aria-label={t('alertes.titre')}>
      <strong>
        {t('alertes.titre')} ({donnees.length})
      </strong>
      <ul>
        {affichees.map((a) => (
          <li key={`${a.type}-${a.seanceId}`} className={`alerte-ligne ${a.niveau}`}>
            <span>
              <b>{heure(a.debut, locale)}</b> {a.message}
            </span>
            <Link to={`/admin/direct?seance=${a.seanceId}`}>{t('tableau.suivre')}</Link>
          </li>
        ))}
      </ul>
      {donnees.length > VISIBLES && (
        <button className="bouton secondaire petit" onClick={() => setTout(!tout)}>
          {tout ? t('alertes.moins') : t('alertes.toutes', { n: donnees.length })}
        </button>
      )}
    </section>
  );
}
