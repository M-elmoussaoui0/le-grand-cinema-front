import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, envoyer } from '../api/client';
import { MaReservation } from '../api/types';
import { Chargement, MessageErreur } from '../components/Etat';
import { useI18n } from '../i18n/I18nContext';
import { heure, jour, prix } from '../utils/format';
import { useDonnees } from '../utils/useDonnees';

/** Sépare les séances à venir (la plus proche en premier) des séances passées. */
export function separer(reservations: MaReservation[], maintenant = Date.now()) {
  const aVenir = reservations.filter((r) => new Date(r.debut).getTime() >= maintenant).reverse();
  const passees = reservations.filter((r) => new Date(r.debut).getTime() < maintenant);
  return { aVenir, passees };
}

/** US13 : retrouver ses réservations et les annuler. */
export default function MesReservations() {
  const { t, locale, messageErreur } = useI18n();
  const { donnees, erreur, chargement, recharger } = useDonnees(
    () => api<MaReservation[]>('/reservations/moi'),
    [],
  );
  const [aConfirmer, setAConfirmer] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'succes' | 'erreur'; texte: string } | null>(null);

  async function annuler(id: number) {
    try {
      const r = await envoyer<{ message: string }>(`/reservations/${id}`, 'DELETE');
      setMessage({ type: 'succes', texte: r.message });
      await recharger();
    } catch (e) {
      setMessage({ type: 'erreur', texte: messageErreur(e) });
    } finally {
      setAConfirmer(null);
    }
  }

  if (chargement) return <Chargement />;
  if (erreur || !donnees)
    return <MessageErreur message={erreur ?? t('commun.erreur')} onReessayer={recharger} />;
  const { aVenir, passees } = separer(donnees);

  const carte = (r: MaReservation) => (
    <article key={r.id} className="carte pile" style={{ gap: 8 }}>
      <div className="ligne espace">
        <strong>{r.film}</strong>
        <span className={`puce ${r.statut === 'payee' ? 'vert' : r.statut === 'annulee' ? '' : 'or'}`}>
          {t(`reservations.statut.${r.statut}`)}
        </span>
      </div>
      <span className="doux petit" style={{ textTransform: 'capitalize' }}>
        {jour(r.debut, locale)} · {heure(r.debut, locale)} · {r.salle} · {r.langue}
      </span>
      {r.places.length > 0 && (
        <span className="petit">
          {t('billet.places')} : {r.places.join(', ')} · {prix(r.montantTotal, locale)}
        </span>
      )}
      <div className="ligne">
        {r.statut === 'payee' && (
          <Link className="bouton petit" to={`/billets/${r.id}`}>
            {t('reservations.voirBillet')}
          </Link>
        )}
        {r.statut === 'en_attente' && (
          <Link className="bouton petit" to={`/reservations/${r.id}/paiement`}>
            {t('reservations.payer')}
          </Link>
        )}
        {r.annulable &&
          (aConfirmer === r.id ? (
            <>
              <button className="bouton petit" onClick={() => annuler(r.id)}>
                {t('reservations.confirmerAnnulation')}
              </button>
              <button className="bouton secondaire petit" onClick={() => setAConfirmer(null)}>
                {t('compte.annuler')}
              </button>
            </>
          ) : (
            <button className="bouton secondaire petit" onClick={() => setAConfirmer(r.id)}>
              {t('reservations.annuler')}
            </button>
          ))}
      </div>
    </article>
  );

  return (
    <section className="pile">
      <h1>{t('reservations.titre')}</h1>
      {message && (
        <p className={`alerte ${message.type}`} role={message.type === 'erreur' ? 'alert' : 'status'}>
          {message.texte}
        </p>
      )}
      {donnees.length === 0 && (
        <div className="carte pile">
          <p style={{ margin: 0 }}>{t('reservations.aucune')}</p>
          <Link className="bouton" to="/">
            {t('reservations.voirProgramme')}
          </Link>
        </div>
      )}
      {aVenir.length > 0 && <h2>{t('reservations.aVenir')}</h2>}
      {aVenir.map(carte)}
      {passees.length > 0 && <h2>{t('reservations.passees')}</h2>}
      {passees.map(carte)}
      <p className="doux petit">{t('reservations.regleAnnulation')}</p>
    </section>
  );
}
