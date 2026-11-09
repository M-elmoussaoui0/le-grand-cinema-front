import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from './i18n/I18nContext';

/** Affiche un composant avec les mêmes fournisseurs que l'application. */
export function afficher(element: ReactElement, { route = '/' } = {}) {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[route]}>{element}</MemoryRouter>
    </I18nProvider>,
  );
}

/** Simule les réponses de l'API, dans l'ordre des appels ou selon le chemin demandé. */
export function simulerApi(reponses: Record<string, unknown | ((init?: RequestInit) => unknown)>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    const chemin = String(url).replace(/^.*\/api/, '');
    const cle = Object.keys(reponses).find(
      (c) =>
        chemin.startsWith(c.replace(/^\w+ /, '')) &&
        (!/^\w+ /.test(c) || c.startsWith(`${init?.method ?? 'GET'} `)),
    );
    if (!cle) return new Response(JSON.stringify({ message: `Non simulé : ${chemin}` }), { status: 500 });
    const valeur = reponses[cle];
    const corps = typeof valeur === 'function' ? (valeur as (i?: RequestInit) => unknown)(init) : valeur;
    if (corps instanceof Response) return corps;
    return new Response(JSON.stringify(corps), { status: 200 });
  });
}
