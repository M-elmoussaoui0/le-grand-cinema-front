import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, envoyer, jetonStocke } from '../api/client';

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'client' | 'admin';
}

interface ReponseConnexion {
  accessToken: string;
  utilisateur: Utilisateur;
}

interface Auth {
  utilisateur: Utilisateur | null;
  /** Vrai tant que la session enregistrée n'a pas été vérifiée auprès de l'API */
  verification: boolean;
  connecter: (email: string, motDePasse: string) => Promise<void>;
  inscrire: (donnees: { nom: string; prenom: string; email: string; motDePasse: string }) => Promise<void>;
  deconnecter: () => void;
  supprimerCompte: () => Promise<void>;
}

const Contexte = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [verification, setVerification] = useState(() => jetonStocke.lire() !== null);

  // Au démarrage : on vérifie que le jeton enregistré est encore valable
  useEffect(() => {
    if (!jetonStocke.lire()) return;
    api<Utilisateur>('/auth/moi')
      .then(setUtilisateur)
      .catch(() => jetonStocke.effacer())
      .finally(() => setVerification(false));
  }, []);

  const ouvrirSession = useCallback((r: ReponseConnexion) => {
    jetonStocke.ecrire(r.accessToken);
    setUtilisateur(r.utilisateur);
  }, []);

  const valeur = useMemo<Auth>(
    () => ({
      utilisateur,
      verification,
      connecter: async (email, motDePasse) =>
        ouvrirSession(await envoyer<ReponseConnexion>('/auth/connexion', 'POST', { email, motDePasse })),
      inscrire: async (donnees) =>
        ouvrirSession(await envoyer<ReponseConnexion>('/auth/inscription', 'POST', donnees)),
      deconnecter: () => {
        jetonStocke.effacer();
        setUtilisateur(null);
      },
      supprimerCompte: async () => {
        await envoyer('/auth/moi', 'DELETE');
        jetonStocke.effacer();
        setUtilisateur(null);
      },
    }),
    [utilisateur, verification, ouvrirSession],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useAuth() {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return contexte;
}
