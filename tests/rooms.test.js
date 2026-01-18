// tests/rooms.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { knex } = require("../database");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:3000";
const JWT_SECRET =
  process.env.IDOPONTFOGLALO_JWT_SECRETKEY ||
  "secretKeyForBookingSystem213edaefw";

let validToken;
let createdRoomId;

beforeAll(async () => {
  validToken = jwt.sign(
    { user_id: 1, email: "admin@test.com" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // cleanup régi tesztadat
  await knex("room").where({ name: "TEST_ROOM" }).del();
});

afterAll(async () => {
  if (createdRoomId) {
    await knex("room").where({ room_id: createdRoomId }).del();
  }
});

describe("Rooms API", () => {
  describe("GET /rooms", () => {
    it("should return all rooms", async () => {
      const res = await request(baseURL)
        .get("/rooms")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 without token", async () => {
      const res = await request(baseURL).get("/rooms");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /rooms", () => {
    it("should create a new room", async () => {
      const res = await request(baseURL)
        .post("/rooms")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "TEST_ROOM",
          capacity: 20,
        });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("room_id");

      createdRoomId = res.body[0].room_id;
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(baseURL)
        .post("/rooms")
        .set("Authorization", `Bearer ${validToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("GET /rooms/:id", () => {
    it("should return room by id", async () => {
      const res = await request(baseURL)
        .get(`/rooms/${createdRoomId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.room_id).toBe(createdRoomId);
    });
  });

  describe("PUT /rooms/:id", () => {
    it("should update room", async () => {
      const res = await request(baseURL)
        .put(`/rooms/${createdRoomId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "UPDATED_TEST_ROOM",
          capacity: 30,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("updated");
    });
  });

  describe("GET /rooms/:id/timeslots", () => {
    it("should return timeslots for a room", async () => {
      const res = await request(baseURL)
        .get(`/rooms/${createdRoomId}/timeslots`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("DELETE /rooms/:id", () => {
    it("should delete room", async () => {
      const res = await request(baseURL)
        .delete(`/rooms/${createdRoomId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain(`Room ${createdRoomId} deleted`);
    });
  });
});
