export interface Film {
  id: number;
  titre: string;
  synopsis: string | null;
  dureeMinutes: number;
  genre: string | null;
  classification: string | null;
}

export interface Salle {
  id: number;
  nom: string;
  capacite: number;
}

export interface PlacesRestantes {
  enLigne: number;
  guichet: number;
  total: number;
  complet: boolean;
}

export interface Seance {
  id: number;
  debut: string;
  fin: string;
  prix: number;
  langue: 'VF' | 'VOST';
  film: Film;
  salle: Salle;
  placesRestantes?: PlacesRestantes;
}

export type StatutPlace = 'libre' | 'occupee' | 'guichet';

export interface PlacePlan {
  id: number;
  numero: number;
  type: 'standard' | 'pmr' | 'vip';
  statut: StatutPlace;
}

export interface Plan {
  seanceId: number;
  placesRestantes: PlacesRestantes;
  rangees: { rangee: string; places: PlacePlan[] }[];
}

export interface ReservationCreee {
  id: number;
  seanceId: number;
  statut: 'en_attente';
  montantTotal: number;
  payerAvant: string;
  placeIds: number[];
}

export interface Billet {
  reservationId: number;
  codeBillet: string;
  qrCode: string;
  film: string;
  salle: string;
  debut: string;
  langue: string;
  places: string[];
  montantTotal: number;
}

export interface MaReservation {
  id: number;
  statut: 'en_attente' | 'payee' | 'annulee';
  montantTotal: number;
  codeBillet: string | null;
  seanceId: number;
  debut: string;
  langue: string;
  film: string;
  salle: string;
  places: string[];
  annulable: boolean;
}

export interface SuiviDirect {
  seanceId: number;
  film: string;
  salle: string;
  debut: string;
  capacite: number;
  vendues: { enLigne: number; guichet: number; total: number };
  enAttentePaiement: number;
  entrees?: number;
  restantes: number;
  tauxRemplissage: number;
  ventesDerniereHeure: number;
  recettes: number;
  misAJourA: string;
}

export interface Remplissage {
  jour: string;
  resume: {
    seances: number;
    placesVendues: number;
    capacite: number;
    tauxRemplissage: number;
    recettes: number;
  };
  parFilm: { film: string; vendues: number; capacite: number; recettes: number; tauxRemplissage: number }[];
  seances: {
    seanceId: number;
    film: string;
    salle: string;
    debut: string;
    capacite: number;
    vendues: number;
    tauxRemplissage: number;
    recettes: number;
  }[];
}

export interface Alerte {
  type: 'presque_complet' | 'complet' | 'pic_ventes';
  niveau: 'attention' | 'critique';
  seanceId: number;
  film: string;
  salle: string;
  debut: string;
  message: string;
}
