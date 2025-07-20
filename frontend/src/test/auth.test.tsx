import { describe, it, expect } from 'vitest';

// Simple test to verify components can be imported without errors
describe('Authentication Components', () => {
  it('can import authentication components without errors', async () => {
    // Test that all authentication components can be imported
    const { LoginForm } = await import('../components/auth/LoginForm');
    const { RegisterForm } = await import('../components/auth/RegisterForm');
    const { ProtectedRoute } = await import('../components/auth/ProtectedRoute');
    const { UserProfile } = await import('../components/auth/UserProfile');
    const { AuthProvider, useAuth } = await import('../contexts/AuthContext');
    const { authApi } = await import('../api/authApi');
    
    expect(LoginForm).toBeDefined();
    expect(RegisterForm).toBeDefined();
    expect(ProtectedRoute).toBeDefined();
    expect(UserProfile).toBeDefined();
    expect(AuthProvider).toBeDefined();
    expect(useAuth).toBeDefined();
    expect(authApi).toBeDefined();
  });

  it('auth API has required methods', async () => {
    const { authApi } = await import('../api/authApi');
    
    expect(typeof authApi.login).toBe('function');
    expect(typeof authApi.register).toBe('function');
    expect(typeof authApi.logout).toBe('function');
    expect(typeof authApi.getCurrentUser).toBe('function');
    expect(typeof authApi.updateProfile).toBe('function');
    expect(typeof authApi.refreshToken).toBe('function');
  });
});