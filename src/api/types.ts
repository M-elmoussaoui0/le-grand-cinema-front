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
