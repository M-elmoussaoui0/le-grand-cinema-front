import { Link, Route, Routes } from 'react-router-dom';
import { Entete } from './components/Entete';
import { useI18n } from './i18n/I18nContext';

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
          <Route path="/" element={<h1>{t('nav.programme')}</h1>} />
          <Route path="*" element={<Introuvable />} />
        </Routes>
      </main>
      <footer className="pied">{t('pied.mentions')}</footer>
    </div>
  );
}
