// tests/roles.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { knex } = require("../database");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:3000";
const JWT_SECRET =
  process.env.IDOPONTFOGLALO_JWT_SECRETKEY ||
  "secretKeyForBookingSystem213edaefw";

let validToken;
let createdRoleId;

beforeAll(async () => {
  validToken = jwt.sign(
    { user_id: 1, email: "admin@test.com" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // cleanup, ha maradt volna régi tesztadat
  await knex("role").where({ role_name: "TEST_ROLE" }).del();
});

afterAll(async () => {
  if (createdRoleId) {
    await knex("role").where({ role_id: createdRoleId }).del();
  }
});

describe("Roles API", () => {
  describe("GET /role", () => {
    it("should return all roles", async () => {
      const res = await request(baseURL)
        .get("/role")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it("should return 401 without token", async () => {
      const res = await request(baseURL).get("/role");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /role", () => {
    it("should create a new role", async () => {
      const res = await request(baseURL)
        .post("/role")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          role_name: "TEST_ROLE",
          role_desc: "Role created by Jest test",
        });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty("role_id");

      createdRoleId = res.body[0].role_id;
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(baseURL)
        .post("/role")
        .set("Authorization", `Bearer ${validToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("GET /role/:role_id", () => {
    it("should return role by id", async () => {
      const res = await request(baseURL)
        .get(`/role/${createdRoleId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.role_id).toBe(createdRoleId);
    });
  });

  describe("PUT /role/:role_id", () => {
    it("should update role", async () => {
      const res = await request(baseURL)
        .put(`/role/${createdRoleId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          role_name: "UPDATED_TEST_ROLE",
          role_desc: "Updated by Jest",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Successful");
    });
  });

  describe("DELETE /role/:role_id", () => {
    it("should delete role", async () => {
      const res = await request(baseURL)
        .delete(`/role/${createdRoleId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain(
        `Role ${createdRoleId} has been removed`
      );
    });
  });
});
