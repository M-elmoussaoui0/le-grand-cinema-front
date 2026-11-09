import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ErreurApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { MessageErreur } from '../components/Etat';
import { useI18n } from '../i18n/I18nContext';

export default function Connexion() {
  const { t } = useI18n();
  const { connecter } = useAuth();
  const navigate = useNavigate();
  const retour = (useLocation().state as { retour?: string } | null)?.retour ?? '/';
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      await connecter(email, motDePasse);
      navigate(retour, { replace: true });
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : t('commun.erreur'));
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <section className="pile" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1>{t('connexion.titre')}</h1>
      <form className="carte pile" onSubmit={soumettre}>
        <label>
          {t('connexion.email')}
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          {t('connexion.motDePasse')}
          <input
            type="password"
            autoComplete="current-password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />
        </label>
        {erreur && <MessageErreur message={erreur} />}
        <button className="bouton large" disabled={envoi}>
          {t('connexion.valider')}
        </button>
      </form>
      <p className="doux">
        {t('connexion.pasDeCompte')} <Link to="/inscription">{t('connexion.creerCompte')}</Link>
      </p>
      <p className="alerte info petit">{t('connexion.demo')}</p>
    </section>
  );
}
