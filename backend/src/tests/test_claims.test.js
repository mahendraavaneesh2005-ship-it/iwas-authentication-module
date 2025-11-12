import request from "supertest";
//import app from "../index.js";
import app from "../app.js";


describe("Claims API", () => {
  test("POST /api/insurance/claims - Submit new claim", async () => {
    const claim = {
      policyId: 1,
      userId: "user123",
      claimAmount: 1000.00,
      description: "Test claim"
    };
    const res = await request(app)
      .post("/api/insurance/claims")
      .send(claim);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("claimStatus");
  });
});
