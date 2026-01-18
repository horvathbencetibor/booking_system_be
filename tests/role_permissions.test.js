// tests/role_permissions.test.js
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { knex } = require("../database");

const baseURL = process.env.TEST_URL || "http://127.0.0.1:3000";
const JWT_SECRET =
  process.env.IDOPONTFOGLALO_JWT_SECRETKEY ||
  "secretKeyForBookingSystem213edaefw";

let validToken;
let roleId;
let permissionId;
let rolePermissionId;

beforeAll(async () => {
  // JWT
  validToken = jwt.sign(
    { user_id: 1, email: "admin@test.com" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // cleanup
  await knex("role_permission").del();
  await knex("permission").where({ permission_name: "TEST_RP_PERMISSION" }).del();
  await knex("role").where({ role_name: "TEST_RP_ROLE" }).del();

  // seed role
  const roles = await knex("role")
    .insert({
      role_name: "TEST_RP_ROLE",
      role_desc: "Role for role-permission tests",
    })
    .returning("*");

  roleId = roles[0].role_id;

  // seed permission
  const permissions = await knex("permission")
    .insert({
      permission_name: "TEST_RP_PERMISSION",
      permission_desc: "Permission for role-permission tests",
      created_at: new Date(),
    })
    .returning("*");

  permissionId = permissions[0].permission_id;
});

afterAll(async () => {
  await knex("role_permission").where({ role_permission_id: rolePermissionId }).del();
  await knex("permission").where({ permission_id: permissionId }).del();
  await knex("role").where({ role_id: roleId }).del();
});

describe("Role-Permissions API", () => {
  describe("GET /role-permissions", () => {
    it("should return all role-permission relations", async () => {
      const res = await request(baseURL)
        .get("/role-permissions")
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it("should return 401 without token", async () => {
      const res = await request(baseURL).get("/role-permissions");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /role-permissions", () => {
    it("should create a role-permission relation", async () => {
      const res = await request(baseURL)
        .post("/role-permissions")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          role_id: roleId,
          permission_id: permissionId,
        });

      expect(res.status).toBe(201);
      expect(Array.isArray(res.body)).toBeTruthy();

      rolePermissionId = res.body[0].role_permission_id;
    });
  });

  describe("GET /role-permissions/:id", () => {
    it("should return role-permission by id", async () => {
      const res = await request(baseURL)
        .get(`/role-permissions/${rolePermissionId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.role_permission_id).toBe(rolePermissionId);
    });
  });

  describe("PUT /role-permissions/:id", () => {
    it("should update role-permission relation", async () => {
      const res = await request(baseURL)
        .put(`/role-permissions/${rolePermissionId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          role_id: roleId,
          permission_id: permissionId,
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("Successful");
    });
  });

  describe("GET /roles/:id/permissions", () => {
    it("should return permissions for a role", async () => {
      const res = await request(baseURL)
        .get(`/roles/${roleId}/permissions`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body[0]).toHaveProperty("permission_id");
    });
  });

  describe("DELETE /role-permissions/:id", () => {
    it("should delete role-permission relation", async () => {
      const res = await request(baseURL)
        .delete(`/role-permissions/${rolePermissionId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain(
        `Role-permission ${rolePermissionId} has been removed`
      );
    });
  });
});
