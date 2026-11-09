import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErreurApi } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { MessageErreur } from '../components/Etat';
import { useI18n } from '../i18n/I18nContext';

/** Même règle que l'API : 8 caractères, une majuscule, une minuscule et un chiffre. */
export const motDePasseValide = (mdp: string) =>
  mdp.length >= 8 && /[a-z]/.test(mdp) && /[A-Z]/.test(mdp) && /\d/.test(mdp);

export default function Inscription() {
  const { t } = useI18n();
  const { inscrire } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', motDePasse: '' });
  const [rgpd, setRgpd] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const champ = (nom: keyof typeof form) => ({
    value: form[nom],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [nom]: e.target.value }),
  });

  async function soumettre(e: FormEvent) {
    e.preventDefault();
    if (!motDePasseValide(form.motDePasse)) return setErreur(t('inscription.regleMotDePasse'));
    try {
      await inscrire(form);
      navigate('/', { replace: true });
    } catch (err) {
      setErreur(err instanceof ErreurApi ? err.message : t('commun.erreur'));
    }
  }

  return (
    <section className="pile" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1>{t('inscription.titre')}</h1>
      <form className="carte pile" onSubmit={soumettre}>
        <label>
          {t('inscription.prenom')}
          <input required autoComplete="given-name" {...champ('prenom')} />
        </label>
        <label>
          {t('inscription.nom')}
          <input required autoComplete="family-name" {...champ('nom')} />
        </label>
        <label>
          {t('connexion.email')}
          <input type="email" required autoComplete="email" {...champ('email')} />
        </label>
        <label>
          {t('connexion.motDePasse')}
          <input type="password" required autoComplete="new-password" {...champ('motDePasse')} />
          <span className="doux petit">{t('inscription.regleMotDePasse')}</span>
        </label>
        <label className="ligne" style={{ fontWeight: 400 }}>
          <input
            type="checkbox"
            required
            checked={rgpd}
            onChange={(e) => setRgpd(e.target.checked)}
            style={{ width: 'auto', minHeight: 0 }}
          />
          <span>{t('inscription.rgpd')}</span>
        </label>
        {erreur && <MessageErreur message={erreur} />}
        <button className="bouton large">{t('inscription.valider')}</button>
      </form>
    </section>
  );
}
