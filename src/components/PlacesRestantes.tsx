import { PlacesRestantes as Places } from '../api/types';
import { useI18n } from '../i18n/I18nContext';

/** En dessous de ce seuil, on prévient le spectateur qu'il reste peu de places. */
export const SEUIL_DERNIERES_PLACES = 20;

export function PlacesRestantes({ places }: { places?: Places }) {
  const { t } = useI18n();
  if (!places) return null;
  if (places.complet) return <span className="puce accent">{t('places.complet')}</span>;
  if (places.enLigne <= SEUIL_DERNIERES_PLACES) {
    return <span className="puce or">{t('places.dernieres', { n: places.enLigne })}</span>;
  }
  return <span className="puce vert">{t('places.restantes', { n: places.enLigne })}</span>;
}
