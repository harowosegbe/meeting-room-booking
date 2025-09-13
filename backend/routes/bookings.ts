import express from "express";
import { body, validationResult, param, query } from "express-validator";
import mongoose from "mongoose";
import Booking from "../models/Booking";
import Room from "../models/Room";
import { requireAdmin } from "../middleware/auth";

const router = express.Router();

// Helper function to check for booking conflicts
const checkBookingConflict = async (
  roomId,
  startTime,
  endTime,
  excludeBookingId = null
) => {
  const conflictQuery = {
    room: roomId,
    status: "confirmed",
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      },
    ],
  };

  if (excludeBookingId) {
    conflictQuery._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(conflictQuery);
  return conflictingBooking;
};

// Get bookings (user sees own bookings, admin sees all)
router.get(
  "/",
  [
    query("room").optional().isMongoId(),
    query("date").optional().isISO8601(),
    query("status").optional().isIn(["confirmed", "cancelled"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { room, date, status } = req.query;
      const filter = {};

      // Regular users can only see their own bookings
      if (req.user.role !== "admin") {
        filter.user = req.user._id;
      }

      // Add optional filters
      if (room) filter.room = room;
      if (status) filter.status = status;

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        filter.startTime = { $gte: startOfDay, $lte: endOfDay };
      }

      const bookings = await Booking.find(filter)
        .populate("room", "name location capacity")
        .populate("user", "firstName lastName email")
        .sort({ startTime: 1 });

      res.json({ bookings });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Server error while fetching bookings" });
    }
  }
);

// Get single booking
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid booking ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const filter = { _id: req.params.id };

      // Regular users can only see their own bookings
      if (req.user.role !== "admin") {
        filter.user = req.user._id;
      }

      const booking = await Booking.findOne(filter)
        .populate("room", "name location capacity amenities")
        .populate("user", "firstName lastName email");

      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({ booking });
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Server error while fetching booking" });
    }
  }
);

// Create new booking
router.post(
  "/",
  [
    body("room").isMongoId().withMessage("Valid room ID is required"),
    body("title")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Meeting title is required"),
    body("startTime").isISO8601().withMessage("Valid start time is required"),
    body("endTime").isISO8601().withMessage("Valid end time is required"),
    body("description").optional().trim(),
    body("attendees").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        room: roomId,
        title,
        startTime,
        endTime,
        description,
        attendees,
      } = req.body;

      // Validate times
      const start = new Date(startTime);
      const end = new Date(endTime);
      const now = new Date();

      if (start <= now) {
        return res
          .status(400)
          .json({ message: "Booking must be in the future" });
      }

      if (start >= end) {
        return res
          .status(400)
          .json({ message: "End time must be after start time" });
      }

      const duration = (end - start) / (1000 * 60 * 60); // hours
      if (duration > 4) {
        return res
          .status(400)
          .json({ message: "Booking duration cannot exceed 4 hours" });
      }

      // Check if room exists and is active
      const room = await Room.findOne({ _id: roomId, isActive: true });
      if (!room) {
        return res
          .status(404)
          .json({ message: "Room not found or not available" });
      }

      // Check for conflicts
      const conflict = await checkBookingConflict(roomId, start, end);
      if (conflict) {
        return res.status(409).json({
          message: "Room is already booked for this time slot",
          conflictingBooking: {
            startTime: conflict.startTime,
            endTime: conflict.endTime,
            title: conflict.title,
          },
        });
      }

      const booking = new Booking({
        room: roomId,
        user: req.user._id,
        title,
        startTime: start,
        endTime: end,
        description,
        attendees: attendees || [],
      });

      await booking.save();
      await booking.populate("room", "name location capacity");

      res.status(201).json({
        message: "Booking created successfully",
        booking,
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Server error while creating booking" });
    }
  }
);

// Update booking (user can update own, admin can update any)
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid booking ID"),
    body("title").optional().trim().isLength({ min: 1 }),
    body("startTime").optional().isISO8601(),
    body("endTime").optional().isISO8601(),
    body("description").optional().trim(),
    body("attendees").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const filter = { _id: req.params.id, status: "confirmed" };

      // Regular users can only update their own bookings
      if (req.user.role !== "admin") {
        filter.user = req.user._id;
      }

      const booking = await Booking.findOne(filter);
      if (!booking) {
        return res
          .status(404)
          .json({ message: "Booking not found or cannot be modified" });
      }

      // If updating times, validate them
      const newStartTime = req.body.startTime
        ? new Date(req.body.startTime)
        : booking.startTime;
      const newEndTime = req.body.endTime
        ? new Date(req.body.endTime)
        : booking.endTime;

      if (req.body.startTime || req.body.endTime) {
        const now = new Date();

        if (newStartTime <= now) {
          return res
            .status(400)
            .json({ message: "Booking must be in the future" });
        }

        if (newStartTime >= newEndTime) {
          return res
            .status(400)
            .json({ message: "End time must be after start time" });
        }

        const duration = (newEndTime - newStartTime) / (1000 * 60 * 60);
        if (duration > 4) {
          return res
            .status(400)
            .json({ message: "Booking duration cannot exceed 4 hours" });
        }

        // Check for conflicts (excluding current booking)
        const conflict = await checkBookingConflict(
          booking.room,
          newStartTime,
          newEndTime,
          booking._id
        );
        if (conflict) {
          return res.status(409).json({
            message: "Room is already booked for this time slot",
            conflictingBooking: {
              startTime: conflict.startTime,
              endTime: conflict.endTime,
              title: conflict.title,
            },
          });
        }
      }

      // Update booking fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          booking[key] = req.body[key];
        }
      });

      await booking.save();
      await booking.populate("room", "name location capacity");

      res.json({
        message: "Booking updated successfully",
        booking,
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Server error while updating booking" });
    }
  }
);

// Cancel booking (user can cancel own, admin can cancel any)
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid booking ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const filter = { _id: req.params.id, status: "confirmed" };

      // Regular users can only cancel their own bookings
      if (req.user.role !== "admin") {
        filter.user = req.user._id;
      }

      const booking = await Booking.findOne(filter);
      if (!booking) {
        return res
          .status(404)
          .json({ message: "Booking not found or already cancelled" });
      }

      booking.status = "cancelled";
      await booking.save();

      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res
        .status(500)
        .json({ message: "Server error while cancelling booking" });
    }
  }
);

// Get room availability for a specific date
router.get(
  "/availability/:roomId",
  [
    param("roomId").isMongoId().withMessage("Invalid room ID"),
    query("date").isISO8601().withMessage("Valid date is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { roomId } = req.params;
      const { date } = req.query;

      // Check if room exists
      const room = await Room.findOne({ _id: roomId, isActive: true });
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const bookings = await Booking.find({
        room: roomId,
        status: "confirmed",
        startTime: { $gte: startOfDay, $lte: endOfDay },
      }).sort({ startTime: 1 });

      res.json({
        room: {
          id: room._id,
          name: room.name,
          capacity: room.capacity,
          location: room.location,
        },
        date,
        bookings: bookings.map((booking) => ({
          id: booking._id,
          title: booking.title,
          startTime: booking.startTime,
          endTime: booking.endTime,
          user: booking.user,
        })),
      });
    } catch (error) {
      console.error("Error fetching availability:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching availability" });
    }
  }
);

export default router;
