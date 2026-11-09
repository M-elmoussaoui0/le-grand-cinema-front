import { lazy, Suspense } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { RouteProtegee } from './auth/RouteProtegee';
import { Entete } from './components/Entete';
import { Chargement } from './components/Etat';
import { useI18n } from './i18n/I18nContext';
import BilletPage from './pages/BilletPage';
import Compte from './pages/Compte';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import MesReservations from './pages/MesReservations';
import Paiement from './pages/Paiement';
import Programmation from './pages/Programmation';
import SeancePage from './pages/SeancePage';

/**
 * US15 : les écrans de gestion ne sont téléchargés que par le personnel.
 * Les spectateurs chargent une application plus légère, plus rapide sur un réseau mobile saturé.
 */
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Direct = lazy(() => import('./pages/admin/Direct'));
const Guichet = lazy(() => import('./pages/admin/Guichet'));
const Scanner = lazy(() => import('./pages/admin/Scanner'));
const Seances = lazy(() => import('./pages/admin/Seances'));
const TableauDeBord = lazy(() => import('./pages/admin/TableauDeBord'));

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
        <Suspense fallback={<Chargement />}>
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
              <Route index element={<Navigate to="/admin/tableau-de-bord" replace />} />
              <Route path="tableau-de-bord" element={<TableauDeBord />} />
              <Route path="seances" element={<Seances />} />
              <Route path="direct" element={<Direct />} />
              <Route path="guichet" element={<Guichet />} />
              <Route path="scanner" element={<Scanner />} />
            </Route>
            <Route path="*" element={<Introuvable />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="pied">{t('pied.mentions')}</footer>
    </div>
  );
}
