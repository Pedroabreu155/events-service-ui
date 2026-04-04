import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Clear sessionStorage before each test
beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});
