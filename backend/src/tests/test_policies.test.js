import request from "supertest";
//import app from "../index.js";
import app from "../app.js";


describe("Policies API", () => {
  test("GET /api/insurance/policies - List user policies", async () => {
    const userId = "user123";
    const res = await request(app)
      .get(`/api/insurance/policies?userId=${userId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
