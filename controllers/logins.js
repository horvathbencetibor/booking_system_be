const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { knex } = require("../database");

const JWT_SECRET = process.env.IDOPONTFOGLALO_JWT_SECRETKEY || "secretKeyForBookingSystem213edaefw";

// POST /auth/login
const login = async (req, reply) => {
  const { email, password } = req.body;

  try {
    const user = await knex("user").where({ email }).first();

    if (!user) {
      return reply.code(401).send({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return reply.code(401).send({ message: "Invalid email or password" });
    }

    // IMPORTANT: fastify.jwt helyett a req.jwtSign-et használjuk
    const token = await reply.jwtSign(
      { user_id: user.user_id, email: user.email },
      { expiresIn: "2h" }
    );

    reply.send({
      token,
      user: { user_id: user.user_id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    reply.code(500).send({ message: "Server error" });
  }
};

// POST /checkauth
const checkAuth = async (req, reply) => {
  try {
    await req.jwtVerify();
    reply.send({ message: "Authenticated", user: req.user });
  } catch (error) {
    reply.code(401).send({ message: "Invalid token" });
  }
};

const logout = async (req, reply) => {
  reply.send({ message: "Logged out successfully" });
};

module.exports = { login, logout, checkAuth };
