import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Billet } from '../api/types';
import { Chargement, MessageErreur } from '../components/Etat';
import { useI18n } from '../i18n/I18nContext';
import { heure, jour, prix } from '../utils/format';
import { useDonnees } from '../utils/useDonnees';

/** US6 : billet électronique à présenter à l'entrée de la salle. */
export default function BilletPage() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const {
    donnees: b,
    erreur,
    chargement,
  } = useDonnees(() => api<Billet>(`/reservations/${id}/billet`), [id]);

  if (chargement) return <Chargement />;
  if (erreur || !b) return <MessageErreur message={erreur ?? t('commun.erreur')} />;

  return (
    <section className="pile" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1>{t('billet.titre')}</h1>
      <article className="billet">
        <div className="billet-haut">
          <h2 style={{ margin: 0 }}>{b.film}</h2>
          <p style={{ margin: '4px 0 0', textTransform: 'capitalize' }}>
            {jour(b.debut, locale)} · <strong>{heure(b.debut, locale)}</strong>
          </p>
        </div>
        <dl className="billet-infos">
          <div>
            <dt>{t('billet.salle')}</dt>
            <dd>{b.salle}</dd>
          </div>
          <div>
            <dt>{t('billet.places')}</dt>
            <dd>{b.places.join(', ')}</dd>
          </div>
          <div>
            <dt>{t('billet.version')}</dt>
            <dd>{b.langue}</dd>
          </div>
          <div>
            <dt>{t('billet.total')}</dt>
            <dd>{prix(b.montantTotal, locale)}</dd>
          </div>
        </dl>
        <div className="billet-qr">
          <img src={b.qrCode} alt={t('billet.qrAlt', { code: b.codeBillet })} width={240} height={240} />
          <code>{b.codeBillet}</code>
        </div>
      </article>
      <p className="doux petit">{t('billet.consigne')}</p>
      <button className="bouton secondaire large" onClick={() => window.print()}>
        {t('billet.imprimer')}
      </button>
    </section>
  );
}
