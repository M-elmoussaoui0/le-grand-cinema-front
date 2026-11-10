import { FormEvent, useCallback, useRef, useState } from 'react';
import { envoyer, ErreurApi } from '../../api/client';
import { CameraQr, cameraDisponible } from '../../components/CameraQr';
import { useI18n } from '../../i18n/I18nContext';
import { heure } from '../../utils/format';

interface Resultat {
  valide: boolean;
  message: string;
  film?: string;
  salle?: string;
  debut?: string;
  places?: string[];
}

/**
 * US7 : contrôle des billets à l'entrée.
 * Fonctionne avec une douchette (qui tape le code puis Entrée) ou avec la caméra du téléphone.
 */
export default function Scanner() {
  const { t, locale } = useI18n();
  const [code, setCode] = useState('');
  const [camera, setCamera] = useState(false);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const champ = useRef<HTMLInputElement>(null);

  const controler = useCallback(
    async (valeur: string) => {
      const c = valeur.trim();
      if (!c) return;
      try {
        setResultat(await envoyer<Resultat>('/billets/scan', 'POST', { code: c }));
      } catch (e) {
        setResultat({ valide: false, message: e instanceof ErreurApi ? e.message : t('commun.erreur') });
      }
      setCode('');
      champ.current?.focus();
    },
    [t],
  );

  function soumettre(e: FormEvent) {
    e.preventDefault();
    controler(code);
  }

  return (
    <div className="pile" style={{ maxWidth: 520 }}>
      <h1 style={{ margin: 0 }}>{t('scanner.titre')}</h1>

      {resultat && (
        <div className={`verdict ${resultat.valide ? 'ok' : 'refus'}`} role="status">
          <strong>{resultat.valide ? t('scanner.valide') : t('scanner.refuse')}</strong>
          <span>{resultat.message}</span>
          {resultat.valide && resultat.debut && (
            <span>
              {resultat.film} · {resultat.salle} · {heure(resultat.debut, locale)} · {t('billet.places')}{' '}
              {resultat.places?.join(', ')}
            </span>
          )}
        </div>
      )}

      <form className="carte pile" onSubmit={soumettre}>
        <label>
          {t('scanner.code')}
          <input
            ref={champ}
            autoFocus
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="LGC-…"
          />
        </label>
        <button className="bouton large">{t('scanner.verifier')}</button>
        <p className="doux petit" style={{ margin: 0 }}>
          {t('scanner.aide')}
        </p>
      </form>

      {cameraDisponible() && (
        <div className="carte pile">
          <button className="bouton secondaire large" onClick={() => setCamera(!camera)}>
            {camera ? t('scanner.arreterCamera') : t('scanner.camera')}
          </button>
          {camera && <CameraQr onCode={controler} />}
        </div>
      )}
    </div>
  );
}
