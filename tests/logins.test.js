// tests/logins.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { knex } = require("../database");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:3000";
const JWT_SECRET =
  process.env.IDOPONTFOGLALO_JWT_SECRETKEY ||
  "secretKeyForBookingSystem213edaefw";

let testUser;
let validPassword = "testpassword123";

beforeAll(async () => {
  // töröljük, ha már létezik
  await knex("user").where({ email: "test@login.com" }).del();

  const hashedPassword = await bcrypt.hash(validPassword, 10);

  const users = await knex("user")
    .insert({
      name: "Test User",
      email: "test@login.com",
      password: hashedPassword,
    })
    .returning("*");

  testUser = users[0];
});

afterAll(async () => {
  await knex("user").where({ email: "test@login.com" }).del();
});

describe("Auth API", () => {
  describe("POST /auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const res = await request(baseURL)
        .post("/auth/login")
        .send({
          email: "test@login.com",
          password: validPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("user_id");
      expect(res.body.user.email).toBe("test@login.com");
    });

    it("should fail with wrong password", async () => {
      const res = await request(baseURL)
        .post("/auth/login")
        .send({
          email: "test@login.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Invalid email or password");
    });

    it("should fail with non-existing email", async () => {
      const res = await request(baseURL)
        .post("/auth/login")
        .send({
          email: "notexists@test.com",
          password: "whatever",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /checkauth", () => {
    it("should return authenticated with valid token", async () => {
      const token = jwt.sign(
        { user_id: testUser.user_id, email: testUser.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      const res = await request(baseURL)
        .post("/checkauth")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Authenticated");
      expect(res.body.user).toHaveProperty("user_id");
    });

    it("should fail with missing token", async () => {
      const res = await request(baseURL).post("/checkauth");

      expect(res.status).toBe(401);
    });

    it("should fail with invalid token", async () => {
      const res = await request(baseURL)
        .post("/checkauth")
        .set("Authorization", "Bearer invalidtoken");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /auth/logout", () => {
    it("should logout successfully", async () => {
      const res = await request(baseURL).post("/auth/logout");

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Logged out");
    });
  });
});
