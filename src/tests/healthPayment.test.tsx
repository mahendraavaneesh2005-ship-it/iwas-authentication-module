import { render, screen, fireEvent } from "@testing-library/react";
import HealthPaymentPage from "../src/frontend/pages/health/payment/page";

describe("HealthPaymentPage", () => {
  it("renders payment page heading", () => {
    render(<HealthPaymentPage />);
    expect(screen.getByText("Complete Your Payment")).toBeInTheDocument();
  });

  it("has a payment method selection", () => {
    render(<HealthPaymentPage />);
    expect(screen.getByLabelText("Credit Card")).toBeInTheDocument();
    expect(screen.getByLabelText("UPI")).toBeInTheDocument();
  });

  // Add more interactive tests like form submission, state changes as per your implementation.
});
