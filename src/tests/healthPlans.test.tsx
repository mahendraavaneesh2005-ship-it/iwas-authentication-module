import { render, screen } from "@testing-library/react";
import HealthPlansPage from "../src/frontend/pages/health/plans/page";

describe("HealthPlansPage", () => {
  it("renders select your health plan title", () => {
    render(<HealthPlansPage />);
    expect(screen.getByText("Select Your Health Plan")).toBeInTheDocument();
  });

  // More tests: mocking fetch, selecting plans, progressing to payment
});
