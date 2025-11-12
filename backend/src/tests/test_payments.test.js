import request from "supertest";
//import app from "../index.js";
import app from "../app.js";


describe("Payments API", () => {
  test("POST /api/insurance/payments - Process payment", async () => {
    const payment = {
      applicationId: 1,
      paymentMethod: "credit_card",
      paymentAmount: 299.00,
      userId: "user123"
    };
    const res = await request(app)
      .post("/api/insurance/payments")
      .send(payment);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("paymentId");
  });
});
