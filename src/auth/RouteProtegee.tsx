import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Chargement } from '../components/Etat';
import { useAuth } from './AuthContext';

/**
 * Protège un écran : redirige vers la connexion si l'utilisateur n'est pas connecté,
 * et vers l'accueil si l'écran est réservé à l'administrateur.
 * La vraie protection est faite par l'API (jeton JWT et rôle vérifiés à chaque requête).
 */
export function RouteProtegee({ children, role }: { children: ReactNode; role?: 'admin' }) {
  const { utilisateur, verification } = useAuth();
  const location = useLocation();
  if (verification) return <Chargement />;
  if (!utilisateur) return <Navigate to="/connexion" replace state={{ retour: location.pathname }} />;
  if (role && utilisateur.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
