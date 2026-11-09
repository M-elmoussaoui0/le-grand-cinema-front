import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Cle, fr } from './fr';

export type Langue = 'fr';

const dictionnaires: Record<Langue, Record<Cle, string>> = { fr };
const locales: Record<Langue, string> = { fr: 'fr-FR' };

interface I18n {
  langue: Langue;
  changerLangue: (l: Langue) => void;
  /** Traduit une clé ; {nom} est remplacé par la valeur correspondante. */
  t: (cle: Cle, valeurs?: Record<string, string | number>) => string;
  locale: string;
}

const Contexte = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [langue, setLangue] = useState<Langue>('fr');

  const t = useCallback(
    (cle: Cle, valeurs: Record<string, string | number> = {}) =>
      dictionnaires[langue][cle].replace(/\{(\w+)\}/g, (_, nom) => String(valeurs[nom] ?? `{${nom}}`)),
    [langue],
  );

  const valeur = useMemo(
    () => ({ langue, changerLangue: setLangue, t, locale: locales[langue] }),
    [langue, t],
  );
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useI18n() {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error('useI18n doit être utilisé dans I18nProvider');
  return contexte;
}
