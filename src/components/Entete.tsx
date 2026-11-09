import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';

export function Entete() {
  const { t } = useI18n();
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
          </nav>
        </div>
      </div>
    </header>
  );
}
