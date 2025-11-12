import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "../src/frontend/contexts/AuthContext";

function TestComponent() {
  const { user } = useAuth();
  return <div>{user ? "Logged in" : "Logged out"}</div>;
}

describe("AuthContext", () => {
  it("shows logged out when no user", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByText("Logged out")).toBeInTheDocument();
  });

  // Add test for login/logout state changes if possible with mocks
});
