import request from "supertest";
//import app from "../index.js";  // Adjust path as necessary
import app from "../app.js";


describe("Health Insurance Applications API", () => {
  test("POST /api/insurance/applications - Create application", async () => {
    const data = {
      userId: "user123",
      fullName: "John Doe",
      email: "john@example.com",
      phone: "1234567890"
    };
    const res = await request(app)
      .post("/api/insurance/applications")
      .send(data);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("applicationId");
  });

  test("GET /api/insurance/applications/:id - Get application details", async () => {
    const appId = 1;  // Use existing or created application ID
    const res = await request(app)
      .get(`/api/insurance/applications/${appId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("fullName");
  });
});
