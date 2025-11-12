import request from "supertest";
//import app from "../index.js";
import app from "../app.js";


describe("Insurance Plans API", () => {
  test("GET /api/insurance/plans - Fetch all plans", async () => {
    const res = await request(app).get("/api/insurance/plans");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
