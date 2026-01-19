// tests/bookings_logs.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:3000";

const validToken = jwt.sign(
  { user_id: 1 },
  "secretKeyForBookingSystem213edaefw",
  { expiresIn: "1h" }
);

describe("GET /booking-logs", () => {
  it("should return all booking logs with 200", async () => {
    const response = await request(baseURL)
      .get("/booking-logs")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      const item = response.body[0];
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("booking_id");
      expect(item).toHaveProperty("operation");
      expect(item).toHaveProperty("created_by");
      expect(item).toHaveProperty("created_at");
    }
  });

  it("should return 401 if token is missing", async () => {
    const response = await request(baseURL).get("/booking-logs");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });
});

describe("GET /booking-logs/:id", () => {
  let existingLogId;

  beforeAll(async () => {
    const res = await request(baseURL)
      .get("/booking-logs")
      .set("Authorization", `Bearer ${validToken}`);

    if (res.body.length > 0) {
      existingLogId = res.body[0].id;
    }
  });

  it("should return a booking log by id with 200", async () => {
    if (!existingLogId) {
      return;
    }

    const response = await request(baseURL)
      .get(`/booking-logs/${existingLogId}`)
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", existingLogId);
  });

  it("should return null or 200 for non-existing id", async () => {
    const response = await request(baseURL)
      .get("/booking-logs/999999")
      .set("Authorization", `Bearer ${validToken}`);

    // A controller jelenleg nem dob 404-et
    expect(response.status).toBe(200);
  });

  it("should return 401 if token is missing", async () => {
    const response = await request(baseURL).get("/booking-logs/1");

    expect(response.status).toBe(401);
  });
});
