import '@testing-library/jest-dom';

beforeEach(() => {
  // Fresh mock for localStorage per test to avoid cross-test pollution
  const store = new Map();
  const ls = {
    getItem: jest.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: jest.fn((key, value) => store.set(key, String(value))),
    removeItem: jest.fn((key) => store.delete(key)),
    clear: jest.fn(() => store.clear()),
    key: jest.fn((index) => Array.from(store.keys())[index] ?? null),
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(window, 'localStorage', {
    value: ls,
    writable: true,
  });

  // Silence window.alert/confirm/prompt in tests; allow control via mocks in cases
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(window, 'confirm').mockImplementation(() => true);
  jest.spyOn(window, 'prompt').mockImplementation(() => null);
});

afterEach(() => {
  jest.clearAllMocks();
});
