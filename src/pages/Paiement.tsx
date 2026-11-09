import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { envoyer, ErreurApi } from '../api/client';
import { ReservationCreee } from '../api/types';
import { MessageErreur } from '../components/Etat';
import { useI18n } from '../i18n/I18nContext';
import { prix } from '../utils/format';

type Moyen = 'apple_pay' | 'google_pay' | 'carte';

/**
 * Jetons de test du prestataire de paiement (sur le modèle de Stripe).
 * En production, le jeton est créé par le formulaire sécurisé du prestataire :
 * le numéro de carte ne passe jamais par notre application.
 */
export const CARTES_TEST = [
  { jeton: 'tok_visa', cle: 'paiement.carteAcceptee' },
  { jeton: 'tok_chargeDeclined', cle: 'paiement.carteRefusee' },
] as const;

/** Temps restant avant la libération des places, au format mm:ss. */
export function tempsRestant(limite: string, maintenant = Date.now()): string | null {
  const secondes = Math.floor((new Date(limite).getTime() - maintenant) / 1000);
  if (secondes <= 0) return null;
  return `${String(Math.floor(secondes / 60)).padStart(2, '0')}:${String(secondes % 60).padStart(2, '0')}`;
}

export default function Paiement() {
  const { id } = useParams();
  const { t, locale } = useI18n();
  const reservation = useLocation().state as ReservationCreee | null;
  const [moyen, setMoyen] = useState<Moyen>('apple_pay');
  const [jeton, setJeton] = useState<string>(CARTES_TEST[0].jeton);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [codeBillet, setCodeBillet] = useState<string | null>(null);
  const [, setTic] = useState(0);

  // Compte à rebours rafraîchi chaque seconde
  useEffect(() => {
    const minuterie = setInterval(() => setTic((n) => n + 1), 1000);
    return () => clearInterval(minuterie);
  }, []);
  const restant = reservation?.payerAvant ? tempsRestant(reservation.payerAvant) : undefined;

  async function payer() {
    setEnvoi(true);
    setErreur(null);
    try {
      // Apple Pay et Google Pay renvoient eux aussi un jeton : ici, le jeton de test accepté
      const r = await envoyer<{ codeBillet: string }>(`/reservations/${id}/paiement`, 'POST', {
        moyen,
        jetonPaiement: moyen === 'carte' ? jeton : 'tok_visa',
      });
      setCodeBillet(r.codeBillet);
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : t('commun.erreur'));
    } finally {
      setEnvoi(false);
    }
  }

  if (codeBillet) {
    return (
      <section className="pile" style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1>{t('paiement.reussi')}</h1>
        <p className="alerte succes">{t('paiement.merci')}</p>
        <Link className="bouton large" to={`/billets/${id}`}>
          {t('paiement.voirBillet')}
        </Link>
      </section>
    );
  }

  return (
    <section className="pile" style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1>{t('paiement.titre')}</h1>
      {reservation && (
        <div className="carte ligne espace">
          <span>{t('paiement.places', { n: reservation.placeIds.length })}</span>
          <strong style={{ fontSize: '1.3rem' }}>{prix(reservation.montantTotal, locale)}</strong>
        </div>
      )}
      {restant && <p className="alerte info">{t('paiement.delai', { temps: restant })}</p>}
      {restant === null && <MessageErreur message={t('paiement.expire')} />}

      <fieldset className="carte pile" style={{ margin: 0 }}>
        <legend className="petit doux">{t('paiement.moyen')}</legend>
        {(['apple_pay', 'google_pay', 'carte'] as const).map((m) => (
          <label key={m} className={`choix ${moyen === m ? 'actif' : ''}`}>
            <input type="radio" name="moyen" value={m} checked={moyen === m} onChange={() => setMoyen(m)} />
            {t(`paiement.${m}`)}
          </label>
        ))}
        {moyen === 'carte' && (
          <label>
            {t('paiement.carteTest')}
            <select value={jeton} onChange={(e) => setJeton(e.target.value)}>
              {CARTES_TEST.map((c) => (
                <option key={c.jeton} value={c.jeton}>
                  {t(c.cle)}
                </option>
              ))}
            </select>
          </label>
        )}
      </fieldset>

      {erreur && <MessageErreur message={erreur} />}
      <button className="bouton large" onClick={payer} disabled={envoi || restant === null}>
        {reservation
          ? t('paiement.payer', { montant: prix(reservation.montantTotal, locale) })
          : t('paiement.payerSimple')}
      </button>
      <p className="doux petit">{t('paiement.securite')}</p>
    </section>
  );
}
