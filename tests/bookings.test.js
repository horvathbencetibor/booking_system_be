// tests/bookings.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { knex } = require("../database");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:3000";

let validToken;
let createdBookingId;

beforeAll(() => {
  validToken = jwt.sign({ user_id: 2 }, "secretKeyForBookingSystem213edaefw", { expiresIn: '1h' });
});

describe("Bookings API", () => {

  describe("GET /bookings", () => {
    it("should return all bookings with 200", async () => {
      const res = await request(baseURL)
        .get("/bookings")
        .set("Authorization", `Bearer ${validToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(baseURL).get("/bookings");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("POST /bookings", () => {
    it("should create a new booking", async () => {
      const res = await request(baseURL)
        .post("/bookings")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          user_id: 2,
          timeslot_id: 2,
          status: "booked",
        });
      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBeTruthy();
      createdBookingId = res.body[0].booking_id;
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(baseURL)
        .post("/bookings")
        .set("Authorization", `Bearer ${validToken}`)
        .send({}); // no user_id or timeslot_id
      expect(res.status).toBe(400);
    });
  });

  describe("GET /bookings/:id", () => {
    it("should return a booking by ID", async () => {
      const res = await request(baseURL)
        .get(`/bookings/${createdBookingId}`)
        .set("Authorization", `Bearer ${validToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("booking_id", createdBookingId);
    });

    it("should return 401 if token is missing", async () => {
      const res = await request(baseURL).get(`/bookings/${createdBookingId}`);
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /bookings/:id", () => {
    it("should update booking status", async () => {
      const res = await request(baseURL)
        .put(`/bookings/${createdBookingId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ status: "completed" });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Status updated successfully");
    });
  });

  describe("POST /bookings/:id/cancel", () => {
    it("should cancel the booking", async () => {
      const res = await request(baseURL)
        .post(`/bookings/${createdBookingId}/cancel`)
        .set("Authorization", `Bearer ${validToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Booking cancelled successfully");
    });
  });

  describe("DELETE /bookings/:id", () => {
    it("should delete the booking", async () => {
      const res = await request(baseURL)
        .delete(`/bookings/${createdBookingId}`)
        .set("Authorization", `Bearer ${validToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain(`Booking ${createdBookingId} deleted`);
    });
  });

  describe("GET /users/:id/bookings", () => {
    it("should return bookings for a user", async () => {
      const res = await request(baseURL)
        .get("/users/1/bookings")
        .set("Authorization", `Bearer ${validToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe("GET /rooms/:id/bookings", () => {
    it("should return bookings for a room", async () => {
      const res = await request(baseURL)
        .get("/rooms/1/bookings")
        .set("Authorization", `Bearer ${validToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

});
