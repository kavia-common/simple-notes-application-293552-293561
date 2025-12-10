/* Global Jest setup for CRA tests, extends jest-dom and loads test utilities. */
import '@testing-library/jest-dom';
// Load our per-test localStorage and dialog mocks
import './__tests__/setupTestUtils';
