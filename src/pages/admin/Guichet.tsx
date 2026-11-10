import { FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, envoyer, ErreurApi } from '../../api/client';
import { Seance } from '../../api/types';
import { MessageErreur } from '../../components/Etat';
import { useI18n } from '../../i18n/I18nContext';
import { dateIso, heure, prix } from '../../utils/format';
import { useDonnees } from '../../utils/useDonnees';

interface Vente {
  codeBillet: string;
  montantTotal: number;
  places: string[];
}

/** US9 : quota de places gardées pour le guichet et vente sur place. */
export default function Guichet() {
  const { t, locale } = useI18n();
  const [params, setParams] = useSearchParams();
  const seanceId = params.get('seance') ?? '';
  const [nombre, setNombre] = useState(1);
  const [quota, setQuota] = useState('');
  const [vente, setVente] = useState<Vente | null>(null);
  const [message, setMessage] = useState<{ type: 'succes' | 'erreur'; texte: string } | null>(null);
  const seances = useDonnees(() => api<Seance[]>(`/seances?date=${dateIso()}`), []);
  const seance = useDonnees(
    () => (seanceId ? api<Seance>(`/seances/${seanceId}`) : Promise.resolve(null)),
    [seanceId],
  );

  const erreurApi = (e: unknown) =>
    setMessage({ type: 'erreur', texte: e instanceof ErreurApi ? e.message : t('commun.erreur') });

  async function vendre(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      setVente(await envoyer<Vente>('/admin/guichet/ventes', 'POST', { seanceId: Number(seanceId), nombre }));
      await seance.recharger();
    } catch (err) {
      erreurApi(err);
    }
  }

  async function modifierQuota(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      await envoyer(`/admin/seances/${seanceId}/quota`, 'PATCH', { quotaGuichet: Number(quota) });
      setMessage({ type: 'succes', texte: t('guichet.quotaModifie', { n: quota }) });
      setQuota('');
      await seance.recharger();
    } catch (err) {
      erreurApi(err);
    }
  }

  const s = seance.donnees;
  return (
    <div className="pile">
      <h1 style={{ margin: 0 }}>{t('guichet.titre')}</h1>
      <label>
        {t('guichet.seance')}
        <select value={seanceId} onChange={(e) => (setVente(null), setParams({ seance: e.target.value }))}>
          <option value="">—</option>
          {seances.donnees?.map((x) => (
            <option key={x.id} value={x.id}>
              {heure(x.debut, locale)} · {x.film.titre} · {x.salle.nom}
            </option>
          ))}
        </select>
      </label>

      {message && (
        <p className={`alerte ${message.type}`} role={message.type === 'erreur' ? 'alert' : 'status'}>
          {message.texte}
        </p>
      )}
      {seance.erreur && <MessageErreur message={seance.erreur} />}

      {s?.placesRestantes && (
        <div className="grille-admin">
          <div className="carte pile">
            <div className="chiffres">
              <div>
                <span className="chiffre">{s.placesRestantes.guichet}</span>
                <span className="doux petit">{t('guichet.restantesGuichet')}</span>
              </div>
              <div>
                <span className="chiffre">{s.placesRestantes.enLigne}</span>
                <span className="doux petit">{t('guichet.restantesEnLigne')}</span>
              </div>
            </div>
            <form className="pile" onSubmit={vendre}>
              <label>
                {t('guichet.nombre')}
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={nombre}
                  onChange={(e) => setNombre(Number(e.target.value))}
                />
              </label>
              <button className="bouton large">
                {t('guichet.vendre', { montant: prix(nombre * s.prix, locale) })}
              </button>
            </form>
            {vente && (
              <div className="alerte succes" role="status">
                {t('guichet.vendu', { places: vente.places.join(', ') })}
                <div>
                  <code>{vente.codeBillet}</code>
                </div>
              </div>
            )}
          </div>

          <form className="carte pile" onSubmit={modifierQuota}>
            <h2 style={{ margin: 0 }}>{t('guichet.quota')}</h2>
            <p className="doux petit" style={{ margin: 0 }}>
              {t('guichet.explicationQuota')}
            </p>
            <label>
              {t('guichet.nouveauQuota')}
              <input
                type="number"
                min={0}
                max={s.salle.capacite}
                required
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
              />
            </label>
            <button className="bouton secondaire large">{t('guichet.enregistrer')}</button>
          </form>
        </div>
      )}
    </div>
  );
}
