import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// The app seeds its fleet with Math.random. A fixed seed keeps every run
// identical so failures are reproducible.
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Node 25+ ships its own global localStorage, which shadows jsdom's and is a
// non-functional stub unless Node is started with --localstorage-file. Use a
// small in-memory Storage so tests behave the same on every Node version.
class MemoryStorage {
  #m = new Map();
  get length() { return this.#m.size; }
  key(i) { return [...this.#m.keys()][i] ?? null; }
  getItem(k) { return this.#m.has(String(k)) ? this.#m.get(String(k)) : null; }
  setItem(k, v) { this.#m.set(String(k), String(v)); }
  removeItem(k) { this.#m.delete(String(k)); }
  clear() { this.#m.clear(); }
}
const storage = new MemoryStorage();
for (const target of [globalThis, window]) {
  Object.defineProperty(target, 'localStorage', { value: storage, configurable: true, writable: true });
}

beforeEach(() => {
  vi.spyOn(Math, 'random').mockImplementation(mulberry32(42));
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
