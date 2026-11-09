import { Link, Route, Routes } from 'react-router-dom';
import { RouteProtegee } from './auth/RouteProtegee';
import { Entete } from './components/Entete';
import { useI18n } from './i18n/I18nContext';
import Compte from './pages/Compte';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
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
          <Route path="*" element={<Introuvable />} />
        </Routes>
      </main>
      <footer className="pied">{t('pied.mentions')}</footer>
    </div>
  );
}
