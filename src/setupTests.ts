import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Les tests sont écrits en français : on fixe la langue (le navigateur de test est en anglais)
beforeEach(() => localStorage.setItem('lgc.langue', 'fr'));

afterEach(() => {
  cleanup();
  localStorage.clear();
});
