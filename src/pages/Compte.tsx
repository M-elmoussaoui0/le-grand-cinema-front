import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { MessageErreur } from '../components/Etat';
import { useI18n } from '../i18n/I18nContext';

export default function Compte() {
  const { t } = useI18n();
  const { utilisateur, deconnecter, supprimerCompte } = useAuth();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  if (!utilisateur) return null;

  async function supprimer() {
    try {
      await supprimerCompte();
      navigate('/', { replace: true });
    } catch {
      setErreur(t('commun.erreur'));
    }
  }

  return (
    <section className="pile">
      <h1>{t('compte.titre')}</h1>
      <div className="carte pile">
        <strong>
          {utilisateur.prenom} {utilisateur.nom}
        </strong>
        <span className="doux">{utilisateur.email}</span>
        <button className="bouton secondaire" onClick={() => (deconnecter(), navigate('/'))}>
          {t('compte.deconnexion')}
        </button>
      </div>

      <div className="carte pile">
        <h2 style={{ margin: 0 }}>{t('compte.donnees')}</h2>
        <p className="doux petit" style={{ margin: 0 }}>
          {t('compte.explicationSuppression')}
        </p>
        {erreur && <MessageErreur message={erreur} />}
        {!confirmation ? (
          <button className="bouton secondaire" onClick={() => setConfirmation(true)}>
            {t('compte.supprimer')}
          </button>
        ) : (
          <div className="ligne">
            <button className="bouton" onClick={supprimer}>
              {t('compte.confirmerSuppression')}
            </button>
            <button className="bouton secondaire" onClick={() => setConfirmation(false)}>
              {t('compte.annuler')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
