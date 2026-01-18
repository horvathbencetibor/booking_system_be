// tests/users.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { knex } = require("../database");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:3000";
const JWT_SECRET =
  process.env.IDOPONTFOGLALO_JWT_SECRETKEY ||
  "secretKeyForBookingSystem213edaefw";

let validToken;
let createdUserId;

beforeAll(async () => {
  validToken = jwt.sign(
    { user_id: 1, email: "admin@test.com" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  if (createdUserId) {
    await knex("user").where({ user_id: createdUserId }).del();
  }
});

describe("Users API", () => {
  describe("POST /users (registration)", () => {
    it("should create a new user", async () => {
      const res = await request(baseURL)
        .post("/users")
        .send({
          name: "TEST USER",
          email: "user_test_" + Date.now() + "@test.com",
          password: "password123",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user_id");
      expect(res.body).toHaveProperty("email");

      createdUserId = res.body.user_id;
    });

    it("should return 409 if email already exists", async () => {
  const email = "duplicate_" + Date.now() + "@test.com";

  await request(baseURL).post("/users").send({
    name: "FIRST USER",
    email,
    password: "password123",
  });

  const res = await request(baseURL).post("/users").send({
    name: "SECOND USER",
    email,
    password: "password123",
  });

  expect(res.status).toBe(409);
  expect(res.body.message).toContain("Email already exists");
  });
  });

  describe("GET /users", () => {
    it("should return all users (auth required)", async () => {
      const res = await request(baseURL)
        .get("/users")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 without token", async () => {
      const res = await request(baseURL).get("/users");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /users/:id", () => {
    it("should return user by id", async () => {
      const res = await request(baseURL)
        .get(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user_id).toBe(createdUserId);
    });
  });

  describe("PUT /users/:id", () => {
    it("should update user", async () => {
      const res = await request(baseURL)
        .put(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "UPDATED USER",
          email: "updated_" + Date.now() + "@test.com",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("updated");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete user", async () => {
      const res = await request(baseURL)
        .delete(`/users/${createdUserId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain(`User ${createdUserId} deleted`);

      createdUserId = null;
    });
  });
});
