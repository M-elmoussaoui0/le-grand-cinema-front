import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ErreurApi } from '../api/client';
import { en } from './en';
import { Cle, fr } from './fr';

export type Langue = 'fr' | 'en';

const dictionnaires: Record<Langue, Record<Cle, string>> = { fr, en };
const locales: Record<Langue, string> = { fr: 'fr-FR', en: 'en-GB' };
const CLE_LANGUE = 'lgc.langue';

/** Langue enregistrée, sinon celle du téléphone : anglais pour un visiteur étranger, français par défaut. */
export function langueInitiale(): Langue {
  const enregistree = localStorage.getItem(CLE_LANGUE);
  if (enregistree === 'fr' || enregistree === 'en') return enregistree;
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : navigator.language ? 'en' : 'fr';
}

interface I18n {
  langue: Langue;
  changerLangue: (l: Langue) => void;
  /** Traduit une clé ; {nom} est remplacé par la valeur correspondante. */
  t: (cle: Cle, valeurs?: Record<string, string | number>) => string;
  /** Message d'erreur dans la langue choisie (l'API répond en français). */
  messageErreur: (e: unknown) => string;
  locale: string;
}

const Contexte = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [langue, setLangue] = useState<Langue>(langueInitiale);

  useEffect(() => {
    document.documentElement.lang = langue;
  }, [langue]);

  const changerLangue = useCallback((l: Langue) => {
    localStorage.setItem(CLE_LANGUE, l);
    setLangue(l);
  }, []);

  const t = useCallback(
    (cle: Cle, valeurs: Record<string, string | number> = {}) =>
      dictionnaires[langue][cle].replace(/\{(\w+)\}/g, (_, nom) => String(valeurs[nom] ?? `{${nom}}`)),
    [langue],
  );

  const messageErreur = useCallback(
    (e: unknown) => {
      if (!(e instanceof ErreurApi)) return t('commun.erreur');
      if (langue === 'fr') return e.message;
      const cle = `erreur.${e.statut}` as Cle;
      return cle in en ? t(cle) : e.message;
    },
    [langue, t],
  );

  const valeur = useMemo(
    () => ({ langue, changerLangue, t, messageErreur, locale: locales[langue] }),
    [langue, changerLangue, t, messageErreur],
  );
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useI18n() {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error('useI18n doit être utilisé dans I18nProvider');
  return contexte;
}
