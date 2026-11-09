/** Adresse de l'API, définie au déploiement (variable VITE_API_URL). */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const CLE_JETON = 'lgc.jeton';

export const jetonStocke = {
  lire: () => localStorage.getItem(CLE_JETON),
  ecrire: (jeton: string) => localStorage.setItem(CLE_JETON, jeton),
  effacer: () => localStorage.removeItem(CLE_JETON),
};

/** Erreur renvoyée par l'API, avec le code HTTP et le message lisible du back end. */
export class ErreurApi extends Error {
  constructor(
    public readonly statut: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Appel à l'API : ajoute le jeton JWT, convertit le JSON
 * et transforme toute réponse en erreur en ErreurApi avec un message compréhensible.
 */
export async function api<T>(chemin: string, options: RequestInit = {}): Promise<T> {
  const jeton = jetonStocke.lire();
  let reponse: Response;
  try {
    reponse = await fetch(`${API_URL}${chemin}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ErreurApi(0, 'Connexion au serveur impossible. Vérifiez votre réseau.');
  }

  const corps = reponse.status === 204 ? null : await reponse.json().catch(() => null);
  if (!reponse.ok) {
    if (reponse.status === 401) jetonStocke.effacer();
    const message = Array.isArray(corps?.message) ? corps.message.join(' ') : corps?.message;
    throw new ErreurApi(reponse.status, message ?? 'Une erreur est survenue.');
  }
  return corps as T;
}

export const envoyer = <T>(chemin: string, methode: string, donnees?: unknown) =>
  api<T>(chemin, { method: methode, body: donnees === undefined ? undefined : JSON.stringify(donnees) });
