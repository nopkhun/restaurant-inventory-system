import { describe, it, expect } from 'vitest';

describe('App Component', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have correct environment', () => {
    expect(typeof window).toBe('object');
  });
});