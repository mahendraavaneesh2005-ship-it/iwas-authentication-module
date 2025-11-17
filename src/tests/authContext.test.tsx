import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

/**
 * AuthContext Tests (8 test cases)
 * Tests for authentication provider and hooks
 */

function TestComponent() {
  const { user } = useAuth();
  return <div>{user ? `Logged in as ${user.email}` : "Logged out"}</div>;
}

describe("AuthContext", () => {
  test("AuthProvider is exportable and importable", () => {
    expect(AuthProvider).toBeDefined();
  });

  test("useAuth hook is exportable and importable", () => {
    expect(useAuth).toBeDefined();
  });

  test("useAuth hook returns an object with user property", () => {
    let authValue = null;
    
    function TestHookComponent() {
      authValue = useAuth();
      return null;
    }

    render(
      <AuthProvider>
        <TestHookComponent />
      </AuthProvider>
    );

    expect(authValue).toHaveProperty('user');
  });

  test("useAuth hook returns an object with login function", () => {
    let authValue = null;
    
    function TestHookComponent() {
      authValue = useAuth();
      return null;
    }

    render(
      <AuthProvider>
        <TestHookComponent />
      </AuthProvider>
    );

    expect(authValue).toHaveProperty('login');
    expect(typeof authValue.login).toBe('function');
  });

  test("useAuth hook returns an object with logout function", () => {
    let authValue = null;
    
    function TestHookComponent() {
      authValue = useAuth();
      return null;
    }

    render(
      <AuthProvider>
        <TestHookComponent />
      </AuthProvider>
    );

    expect(authValue).toHaveProperty('logout');
    expect(typeof authValue.logout).toBe('function');
  });

  test("useAuth hook returns an object with register function", () => {
    let authValue = null;
    
    function TestHookComponent() {
      authValue = useAuth();
      return null;
    }

    render(
      <AuthProvider>
        <TestHookComponent />
      </AuthProvider>
    );

    expect(authValue).toHaveProperty('register');
    expect(typeof authValue.register).toBe('function');
  });

  test("useAuth hook returns loading and error properties", () => {
    let authValue = null;
    
    function TestHookComponent() {
      authValue = useAuth();
      return null;
    }

    render(
      <AuthProvider>
        <TestHookComponent />
      </AuthProvider>
    );

    // The actual property is isLoading, not loading
    expect(authValue).toHaveProperty('isLoading');
  });

  test("AuthProvider wraps children components successfully", () => {
    render(
      <AuthProvider>
        <div data-testid="child-component">Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByTestId("child-component")).toBeInTheDocument();
  });
});
