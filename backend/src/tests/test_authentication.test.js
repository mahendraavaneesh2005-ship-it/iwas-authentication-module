import request from "supertest";
//import app from "../index.js";
import app from "../app.js";


describe("Authentication API", () => {
  it("registers a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "Password123",
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("userId");
  });

  it("logs in a user", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "Password123",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
