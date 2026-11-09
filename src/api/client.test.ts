import { api, ErreurApi, jetonStocke } from './client';

describe("client de l'API", () => {
  const repondre = (statut: number, corps: unknown) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(corps), { status: statut }));

  afterEach(() => vi.restoreAllMocks());

  it('ajoute le jeton JWT quand l’utilisateur est connecté', async () => {
    jetonStocke.ecrire('abc');
    const fetch = repondre(200, { ok: true });
    await api('/auth/moi');
    expect(fetch.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer abc' });
  });

  it("transforme une erreur de l'API en message lisible", async () => {
    repondre(409, { statusCode: 409, message: 'Une des places choisies est déjà réservée.' });
    await expect(api('/reservations')).rejects.toEqual(
      new ErreurApi(409, 'Une des places choisies est déjà réservée.'),
    );
  });

  it('assemble les messages de validation', async () => {
    repondre(400, { message: ['E-mail invalide.', 'Mot de passe trop court.'] });
    await expect(api('/auth/inscription')).rejects.toThrow('E-mail invalide. Mot de passe trop court.');
  });

  it('efface le jeton expiré (401)', async () => {
    jetonStocke.ecrire('expire');
    repondre(401, { message: 'Session expirée ou jeton invalide.' });
    await expect(api('/auth/moi')).rejects.toBeInstanceOf(ErreurApi);
    expect(jetonStocke.lire()).toBeNull();
  });

  it('signale une coupure réseau', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(api('/films')).rejects.toMatchObject({ statut: 0 });
  });
});
