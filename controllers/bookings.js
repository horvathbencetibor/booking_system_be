// controllers/bookings.js
const { knex } = require("../database");


// GET all bookings
const getBookings = async (req, reply) => {
  try {
    const data = await knex("booking").select("*");
    reply.send(data);
  } catch (error) {
    reply.send(error);
  }
};

// GET booking by id
const getBookingById = async (req, reply) => {
  const { id } = req.params;

  try {
    const booking = await knex("booking").select("*").where({ booking_id: id });
    reply.send(booking[0]);
  } catch (error) {
    reply.send(error);
  }
};

// CREATE new booking
const addBooking = async (req, reply) => {
  const { user_id, timeslot_id, status } = req.body;
  const created_at = new Date();

  try {
    const newBooking = await knex("booking")
      .insert({
        user_id,
        timeslot_id,
        status: status || "booked",
        created_at,
      })
      .returning("*");

    reply.code(201).send(newBooking);
  } catch (error) {
    reply.send(error);
  }
};

// UPDATE booking status
const updateBookingStatus = async (req, reply) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await knex("booking")
      .where({ booking_id: id })
      .update({ status });

    reply.send({ message: "Status updated successfully" });
  } catch (error) {
    reply.send(error);
  }
};

// DELETE booking
const deleteBooking = async (req, reply) => {
  const { id } = req.params;

  try {
    await knex("booking").where({ booking_id: id }).del();
    reply.send({ message: `Booking ${id} deleted` });
  } catch (error) {
    reply.send(error);
  }
};

// GET bookings by user
const getBookingsByUser = async (req, reply) => {
  const { id } = req.params;

  try {
    const data = await knex("booking")
      .join("timeslot", "booking.timeslot_id", "timeslot.timeslot_id")
      .join("room", "timeslot.room_id", "room.room_id")
      .select(
        "booking.*",
        "timeslot.start_time",
        "timeslot.end_time",
        "room.name as room_name"
      )
      .where("booking.user_id", id);

    reply.send(data);
  } catch (error) {
    reply.send(error);
  }
};

// GET bookings by room
const getBookingsByRoom = async (req, reply) => {
  const { id } = req.params;

  try {
    const data = await knex("booking")
      .join("timeslot", "booking.timeslot_id", "timeslot.timeslot_id")
      .select(
        "booking.*",
        "timeslot.start_time",
        "timeslot.end_time"
      )
      .where("timeslot.room_id", id);

    reply.send(data);
  } catch (error) {
    reply.send(error);
  }
};

// Cancel booking (simple endpoint)
const cancelBooking = async (req, reply) => {
  const { id } = req.params;

  try {
    await knex("booking")
      .where({ booking_id: id })
      .update({ status: "cancelled" });

    reply.send({ message: "Booking cancelled successfully" });
  } catch (error) {
    reply.send(error);
  }
};

module.exports = {
  getBookings,
  getBookingById,
  addBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingsByUser,
  getBookingsByRoom,
  cancelBooking,
};
