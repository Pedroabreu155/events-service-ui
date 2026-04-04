import '@testing-library/jest-dom';

// Mock import.meta.env
(global as any).import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3333',
    },
  },
};

// Clear sessionStorage before each test
beforeEach(() => {
  sessionStorage.clear();
  jest.clearAllMocks();
});
