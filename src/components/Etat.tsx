import { useI18n } from '../i18n/I18nContext';

export function Chargement() {
  const { t } = useI18n();
  return (
    <p className="chargement" role="status">
      {t('commun.chargement')}
    </p>
  );
}

export function MessageErreur({ message, onReessayer }: { message: string; onReessayer?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="alerte erreur ligne espace" role="alert">
      <span>{message}</span>
      {onReessayer && (
        <button className="bouton secondaire petit" onClick={onReessayer}>
          {t('commun.reessayer')}
        </button>
      )}
    </div>
  );
}
