import { act, renderHook, waitFor } from '@testing-library/react';
import { useDonnees } from './useDonnees';

describe('US15 – rafraîchissement économe (front)', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("ne rafraîchit pas quand l'onglet est en arrière-plan, puis reprend au retour", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const charger = vi.fn().mockResolvedValue('ok');
    const visibilite = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    renderHook(() => useDonnees(charger, [], 10_000));
    await waitFor(() => expect(charger).toHaveBeenCalledTimes(1));

    await act(() => vi.advanceTimersByTimeAsync(30_000));
    expect(charger).toHaveBeenCalledTimes(1);

    visibilite.mockReturnValue('visible');
    await act(async () => document.dispatchEvent(new Event('visibilitychange')));
    expect(charger).toHaveBeenCalledTimes(2);
  });
});
