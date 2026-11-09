/** Barre de remplissage : verte, puis orange à 75 %, rouge à 90 %. */
export function Jauge({ taux, libelle }: { taux: number; libelle: string }) {
  const couleur = taux >= 90 ? 'var(--accent)' : taux >= 75 ? 'var(--or)' : 'var(--vert)';
  return (
    <div
      className="jauge"
      role="progressbar"
      aria-label={libelle}
      aria-valuenow={taux}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div style={{ width: `${Math.min(taux, 100)}%`, background: couleur }} />
    </div>
  );
}
