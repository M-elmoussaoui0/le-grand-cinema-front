import { NavLink, Outlet } from 'react-router-dom';
import { Alertes } from '../../components/Alertes';
import { useI18n } from '../../i18n/I18nContext';

/** Espace de gestion réservé au personnel du cinéma. */
export default function AdminLayout() {
  const { t } = useI18n();
  return (
    <section className="pile">
      <nav className="onglets" aria-label={t('nav.admin')}>
        <NavLink to="/admin/tableau-de-bord">{t('admin.tableau')}</NavLink>
        <NavLink to="/admin/seances">{t('admin.seances')}</NavLink>
        <NavLink to="/admin/direct">{t('admin.direct')}</NavLink>
        <NavLink to="/admin/guichet">{t('admin.guichet')}</NavLink>
      </nav>
      <Alertes />
      <Outlet />
    </section>
  );
}
