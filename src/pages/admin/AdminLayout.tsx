import { NavLink, Outlet } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

/** Espace de gestion réservé au personnel du cinéma. */
export default function AdminLayout() {
  const { t } = useI18n();
  return (
    <section className="pile">
      <nav className="onglets" aria-label={t('nav.admin')}>
        <NavLink to="/admin/seances">{t('admin.seances')}</NavLink>
      </nav>
      <Outlet />
    </section>
  );
}
