// tests/permissions.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { knex } = require("../database");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:3000";
const JWT_SECRET =
  process.env.IDOPONTFOGLALO_JWT_SECRETKEY ||
  "secretKeyForBookingSystem213edaefw";

let validToken;
let createdPermissionId;

beforeAll(async () => {
  // JWT token
  validToken = jwt.sign(
    { user_id: 1, email: "admin@test.com" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // cleanup ha maradt volna korábbi tesztadat
  await knex("permission")
    .where({ permission_name: "TEST_PERMISSION" })
    .del();
});

afterAll(async () => {
  if (createdPermissionId) {
    await knex("permission")
      .where({ permission_id: createdPermissionId })
      .del();
  }
});

describe("Permissions API", () => {
  describe("GET /permission", () => {
    it("should return all permissions", async () => {
      const res = await request(baseURL)
        .get("/permission")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it("should return 401 without token", async () => {
      const res = await request(baseURL).get("/permission");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /permission", () => {
    it("should create a new permission", async () => {
      const res = await request(baseURL)
        .post("/permission")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          permission_name: "TEST_PERMISSION",
          permission_desc: "Permission created by Jest test",
        });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty("permission_id");

      createdPermissionId = res.body[0].permission_id;
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(baseURL)
        .post("/permission")
        .set("Authorization", `Bearer ${validToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe("GET /permission/:permission_id", () => {
    it("should return permission by id", async () => {
      const res = await request(baseURL)
        .get(`/permission/${createdPermissionId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.permission_id).toBe(createdPermissionId);
    });

    it("should return 401 without token", async () => {
      const res = await request(baseURL).get(
        `/permission/${createdPermissionId}`
      );

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /permission/:permission_id", () => {
    it("should update permission", async () => {
      const res = await request(baseURL)
        .put(`/permission/${createdPermissionId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          permission_name: "UPDATED_TEST_PERMISSION",
          permission_desc: "Updated by Jest",
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Successfull");
    });
  });

  describe("DELETE /permission/:permission_id", () => {
    it("should delete permission", async () => {
      const res = await request(baseURL)
        .delete(`/permission/${createdPermissionId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain(
        `Permission ${createdPermissionId} has been removed`
      );
    });
  });
});
