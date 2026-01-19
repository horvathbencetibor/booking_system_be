// tests/timeslots.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { knex } = require("../database");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:3000";
const JWT_SECRET =
  process.env.IDOPONTFOGLALO_JWT_SECRETKEY ||
  "secretKeyForBookingSystem213edaefw";

let validToken;
let testRoomId;
let createdTimeslotId;

beforeAll(async () => {
  validToken = jwt.sign(
    { user_id: 1, email: "admin@test.com" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // teszt room
  const [room] = await knex("room")
    .insert({
      name: "TEST_TIMESLOT_ROOM",
      capacity: 10,
      created_at: new Date(),
    })
    .returning("*");

  testRoomId = room.room_id;
});

afterAll(async () => {
  if (createdTimeslotId) {
    await knex("timeslot").where({ timeslot_id: createdTimeslotId }).del();
  }
  if (testRoomId) {
    await knex("room").where({ room_id: testRoomId }).del();
  }
});

describe("Timeslots API", () => {
  describe("GET /timeslots", () => {
    it("should return all timeslots", async () => {
      const res = await request(baseURL)
        .get("/timeslots")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 without token", async () => {
      const res = await request(baseURL).get("/timeslots");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /timeslots", () => {
    it("should create a new timeslot", async () => {
      const res = await request(baseURL)
        .post("/timeslots")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          room_id: testRoomId,
          start_time: "2030-01-01T10:00:00.000Z",
          end_time: "2030-01-01T11:00:00.000Z",
        });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("timeslot_id");

      createdTimeslotId = res.body[0].timeslot_id;
    });

    it("should fail if body is invalid", async () => {
      const res = await request(baseURL)
        .post("/timeslots")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          room_id: testRoomId,
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /timeslots/:id", () => {
    it("should return timeslot by id", async () => {
      const res = await request(baseURL)
        .get(`/timeslots/${createdTimeslotId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.timeslot_id).toBe(createdTimeslotId);
    });
  });

  describe("PUT /timeslots/:id", () => {
    it("should update timeslot", async () => {
      const res = await request(baseURL)
        .put(`/timeslots/${createdTimeslotId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          room_id: testRoomId,
          start_time: "2030-01-01T12:00:00.000Z",
          end_time: "2030-01-01T13:00:00.000Z",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("updated");
    });
  });

  describe("GET /rooms/:id/available-timeslots", () => {
    it("should return available timeslots for a room", async () => {
      const res = await request(baseURL)
        .get(`/rooms/${testRoomId}/available-timeslots`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("DELETE /timeslots/:id", () => {
    it("should delete timeslot", async () => {
      const res = await request(baseURL)
        .delete(`/timeslots/${createdTimeslotId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain(`Timeslot ${createdTimeslotId} deleted`);
    });
  });
});
