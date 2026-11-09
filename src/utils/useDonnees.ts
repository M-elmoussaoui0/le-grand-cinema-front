import { useCallback, useEffect, useState } from 'react';
import { ErreurApi } from '../api/client';

/**
 * Charge des données depuis l'API et gère les états chargement / erreur.
 * Avec « intervalle », les données sont rechargées régulièrement (tableau de bord en direct).
 */
export function useDonnees<T>(charger: () => Promise<T>, dependances: unknown[], intervalle?: number) {
  const [donnees, setDonnees] = useState<T | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recharger = useCallback(charger, dependances);

  const executer = useCallback(async () => {
    try {
      setDonnees(await recharger());
      setErreur(null);
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'Une erreur est survenue.');
    } finally {
      setChargement(false);
    }
  }, [recharger]);

  useEffect(() => {
    setChargement(true);
    executer();
    if (!intervalle) return;
    // US15 : pas de rafraîchissement quand l'onglet est en arrière-plan (moins de charge sur l'API)
    const minuterie = setInterval(() => {
      if (document.visibilityState === 'visible') executer();
    }, intervalle);
    const auRetour = () => document.visibilityState === 'visible' && executer();
    document.addEventListener('visibilitychange', auRetour);
    return () => {
      clearInterval(minuterie);
      document.removeEventListener('visibilitychange', auRetour);
    };
  }, [executer, intervalle]);

  return { donnees, erreur, chargement, recharger: executer };
}
