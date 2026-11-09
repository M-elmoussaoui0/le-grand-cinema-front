import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { RouteProtegee } from './auth/RouteProtegee';
import { Entete } from './components/Entete';
import { useI18n } from './i18n/I18nContext';
import AdminLayout from './pages/admin/AdminLayout';
import Direct from './pages/admin/Direct';
import Guichet from './pages/admin/Guichet';
import Seances from './pages/admin/Seances';
import BilletPage from './pages/BilletPage';
import Compte from './pages/Compte';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import MesReservations from './pages/MesReservations';
import Paiement from './pages/Paiement';
import Programmation from './pages/Programmation';
import SeancePage from './pages/SeancePage';

function Introuvable() {
  const { t } = useI18n();
  return (
    <section>
      <h1>{t('introuvable.titre')}</h1>
      <Link to="/" className="bouton">
        {t('introuvable.lien')}
      </Link>
    </section>
  );
}

export default function App() {
  const { t } = useI18n();
  return (
    <div className="app">
      <Entete />
      <main className="contenu">
        <Routes>
          <Route path="/" element={<Programmation />} />
          <Route path="/seances/:id" element={<SeancePage />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route
            path="/compte"
            element={
              <RouteProtegee>
                <Compte />
              </RouteProtegee>
            }
          />
          <Route
            path="/reservations/:id/paiement"
            element={
              <RouteProtegee>
                <Paiement />
              </RouteProtegee>
            }
          />
          <Route
            path="/billets/:id"
            element={
              <RouteProtegee>
                <BilletPage />
              </RouteProtegee>
            }
          />
          <Route
            path="/reservations"
            element={
              <RouteProtegee>
                <MesReservations />
              </RouteProtegee>
            }
          />
          <Route
            path="/admin"
            element={
              <RouteProtegee role="admin">
                <AdminLayout />
              </RouteProtegee>
            }
          >
            <Route index element={<Navigate to="/admin/seances" replace />} />
            <Route path="seances" element={<Seances />} />
            <Route path="direct" element={<Direct />} />
            <Route path="guichet" element={<Guichet />} />
          </Route>
          <Route path="*" element={<Introuvable />} />
        </Routes>
      </main>
      <footer className="pied">{t('pied.mentions')}</footer>
    </div>
  );
}
