import { FormEvent, useState } from 'react';
import { api, envoyer, ErreurApi } from '../../api/client';
import { Film, Salle, Seance } from '../../api/types';
import { Chargement, MessageErreur } from '../../components/Etat';
import { useI18n } from '../../i18n/I18nContext';
import { dateIso, heure } from '../../utils/format';
import { useDonnees } from '../../utils/useDonnees';

const formulaireVide = {
  filmId: '',
  salleId: '',
  date: dateIso(1),
  heure: '20:30',
  prix: '9.50',
  langue: 'VF',
  quotaGuichet: '',
};

/** US8 : création des séances par l'administrateur. */
export default function Seances() {
  const { t, locale } = useI18n();
  const [form, setForm] = useState(formulaireVide);
  const [message, setMessage] = useState<{ type: 'succes' | 'erreur'; texte: string } | null>(null);
  const films = useDonnees(() => api<Film[]>('/films'), []);
  const salles = useDonnees(() => api<Salle[]>('/admin/salles'), []);
  const seances = useDonnees(() => api<Seance[]>(`/seances?date=${form.date}`), [form.date]);
  const champ = (nom: keyof typeof form) => ({
    value: form[nom],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [nom]: e.target.value }),
  });

  async function creer(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const s = await envoyer<{ fin: string }>('/admin/seances', 'POST', {
        filmId: Number(form.filmId),
        salleId: Number(form.salleId),
        debut: `${form.date}T${form.heure}`,
        prix: Number(form.prix),
        langue: form.langue,
        ...(form.quotaGuichet !== '' ? { quotaGuichet: Number(form.quotaGuichet) } : {}),
      });
      setMessage({ type: 'succes', texte: t('admin.seanceCreee', { fin: heure(s.fin, locale) }) });
      await seances.recharger();
    } catch (err) {
      setMessage({ type: 'erreur', texte: err instanceof ErreurApi ? err.message : t('commun.erreur') });
    }
  }

  if (films.chargement || salles.chargement) return <Chargement />;

  return (
    <div className="grille-admin">
      <form className="carte pile" onSubmit={creer}>
        <h1 style={{ margin: 0 }}>{t('admin.nouvelleSeance')}</h1>
        <label>
          {t('admin.film')}
          <select required {...champ('filmId')}>
            <option value="">—</option>
            {films.donnees?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.titre} ({f.dureeMinutes} min)
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('admin.salle')}
          <select required {...champ('salleId')}>
            <option value="">—</option>
            {salles.donnees?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom} – {s.capacite} places
              </option>
            ))}
          </select>
        </label>
        <div className="ligne" style={{ flexWrap: 'nowrap' }}>
          <label style={{ flex: 1 }}>
            {t('admin.date')}
            <input type="date" required {...champ('date')} />
          </label>
          <label style={{ flex: 1 }}>
            {t('admin.heure')}
            <input type="time" required {...champ('heure')} />
          </label>
        </div>
        <div className="ligne" style={{ flexWrap: 'nowrap' }}>
          <label style={{ flex: 1 }}>
            {t('admin.prix')}
            <input type="number" min="0" step="0.5" required {...champ('prix')} />
          </label>
          <label style={{ flex: 1 }}>
            {t('admin.langue')}
            <select {...champ('langue')}>
              <option value="VF">VF</option>
              <option value="VOST">VOST</option>
            </select>
          </label>
        </div>
        <label>
          {t('admin.quota')}
          <input type="number" min="0" placeholder={t('admin.quotaDefaut')} {...champ('quotaGuichet')} />
        </label>
        {message && (
          <p className={`alerte ${message.type}`} role={message.type === 'erreur' ? 'alert' : 'status'}>
            {message.texte}
          </p>
        )}
        <button className="bouton large">{t('admin.creer')}</button>
        <p className="doux petit" style={{ margin: 0 }}>
          {t('admin.regleFin')}
        </p>
      </form>

      <div className="pile">
        <h2 style={{ margin: 0 }}>{t('admin.seancesDuJour')}</h2>
        {seances.erreur && <MessageErreur message={seances.erreur} />}
        {seances.donnees?.length === 0 && <p className="doux">{t('programme.aucuneSeance')}</p>}
        <ul className="liste-seances">
          {seances.donnees?.map((s) => (
            <li key={s.id} className="carte">
              <strong>
                {heure(s.debut, locale)}–{heure(s.fin, locale)}
              </strong>{' '}
              {s.film.titre}
              <div className="doux petit">
                {s.salle.nom} · {s.langue} · {s.placesRestantes?.total ?? '–'} {t('admin.placesLibres')}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
