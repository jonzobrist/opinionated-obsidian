import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mocks for tests
vi.stubGlobal('Notice', vi.fn());
