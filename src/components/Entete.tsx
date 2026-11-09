import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';

export function Entete() {
  const { t } = useI18n();
  const { utilisateur } = useAuth();
  return (
    <header className="entete">
      <div className="entete-int">
        <Link to="/" className="logo" aria-label={t('app.nom')}>
          <img src="/favicon.svg" alt="" width={28} height={28} />
          Le Grand <span>Cinéma</span>
        </Link>
        <div className="entete-actions">
          <nav className="nav" aria-label="Navigation principale">
            <NavLink to="/" end>
              {t('nav.programme')}
            </NavLink>
            {utilisateur && <NavLink to="/reservations">{t('nav.billets')}</NavLink>}
            {utilisateur?.role === 'admin' && <NavLink to="/admin">{t('nav.admin')}</NavLink>}
            {utilisateur ? (
              <NavLink to="/compte">{t('nav.compte')}</NavLink>
            ) : (
              <NavLink to="/connexion">{t('nav.connexion')}</NavLink>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
