// tests/user_roles.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { knex } = require("../database");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:3000";
const JWT_SECRET =
  process.env.IDOPONTFOGLALO_JWT_SECRETKEY ||
  "secretKeyForBookingSystem213edaefw";

let validToken;
let testUserId;
let testRoleId;
let createdUserRoleId;

beforeAll(async () => {
  validToken = jwt.sign(
    { user_id: 1, email: "admin@test.com" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // teszt user
  const [user] = await knex("user")
    .insert({
      name: "TEST USER ROLE",
      email: "user_role_test@test.com",
      password: "hashedpassword",
      created_at: new Date(),
    })
    .returning("*");

  testUserId = user.user_id;

  // teszt role
  const [role] = await knex("role")
    .insert({
      role_name: "TEST_ROLE_UR",
      role_desc: "User-role test role",
      created_at: new Date(),
    })
    .returning("*");

  testRoleId = role.role_id;
});

afterAll(async () => {
  if (createdUserRoleId) {
    await knex("user_role")
      .where({ user_role_id: createdUserRoleId })
      .del();
  }

  if (testUserId) {
    await knex("user").where({ user_id: testUserId }).del();
  }

  if (testRoleId) {
    await knex("role").where({ role_id: testRoleId }).del();
  }
});

describe("User-Roles API", () => {
  describe("GET /user-roles", () => {
    it("should return all user-role relations", async () => {
      const res = await request(baseURL)
        .get("/user-roles")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should return 401 without token", async () => {
      const res = await request(baseURL).get("/user-roles");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /user-roles", () => {
    it("should create a new user-role relation", async () => {
      const res = await request(baseURL)
        .post("/user-roles")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          user_id: testUserId,
          role_id: testRoleId,
        });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("user_role_id");

      createdUserRoleId = res.body[0].user_role_id;
    });

    it("should fail with invalid body", async () => {
      const res = await request(baseURL)
        .post("/user-roles")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          user_id: testUserId,
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /user-roles/:id", () => {
    it("should return user-role by id", async () => {
      const res = await request(baseURL)
        .get(`/user-roles/${createdUserRoleId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user_role_id).toBe(createdUserRoleId);
    });
  });

  describe("PUT /user-roles/:id", () => {
    it("should update user-role relation", async () => {
      const res = await request(baseURL)
        .put(`/user-roles/${createdUserRoleId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          user_id: testUserId,
          role_id: testRoleId,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Successful edit");
    });
  });

  describe("GET /users/:id/roles", () => {
    it("should return roles for a user", async () => {
      const res = await request(baseURL)
        .get(`/users/${testUserId}/roles`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("DELETE /user-roles/:id", () => {
    it("should delete user-role relation", async () => {
      const res = await request(baseURL)
        .delete(`/user-roles/${createdUserRoleId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain(
        `User-role ${createdUserRoleId} has been removed`
      );
    });
  });
});
