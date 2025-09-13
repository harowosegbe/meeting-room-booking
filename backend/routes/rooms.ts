import express from "express";
import { body, validationResult, param } from "express-validator";
import Room from "../models/Room";
import { requireAdmin } from "../middleware/auth";

const router = express.Router();

// Get all rooms (available to all authenticated users)
router.get("/", async (req, res) => {
  try {
    const { active = "true" } = req.query;
    const filter = active === "true" ? { isActive: true } : {};

    const rooms = await Room.find(filter).sort({ name: 1 });
    res.json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Server error while fetching rooms" });
  }
});

// Get single room by ID
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid room ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const room = await Room.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      res.json({ room });
    } catch (error) {
      console.error("Error fetching room:", error);
      res.status(500).json({ message: "Server error while fetching room" });
    }
  }
);

// Create new room (admin only)
router.post(
  "/",
  requireAdmin,
  [
    body("name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Room name is required"),
    body("capacity")
      .isInt({ min: 1, max: 100 })
      .withMessage("Capacity must be between 1 and 100"),
    body("location")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Location is required"),
    body("description").optional().trim(),
    body("amenities").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, capacity, location, description, amenities } = req.body;

      // Check if room with same name already exists
      const existingRoom = await Room.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
      if (existingRoom) {
        return res
          .status(400)
          .json({ message: "Room with this name already exists" });
      }

      const room = new Room({
        name,
        capacity,
        location,
        description,
        amenities: amenities || [],
      });

      await room.save();
      res.status(201).json({
        message: "Room created successfully",
        room,
      });
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ message: "Server error while creating room" });
    }
  }
);

// Update room (admin only)
router.put(
  "/:id",
  requireAdmin,
  [
    param("id").isMongoId().withMessage("Invalid room ID"),
    body("name").optional().trim().isLength({ min: 1 }),
    body("capacity").optional().isInt({ min: 1, max: 100 }),
    body("location").optional().trim().isLength({ min: 1 }),
    body("description").optional().trim(),
    body("amenities").optional().isArray(),
    body("isActive").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const room = await Room.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Check if new name conflicts with existing room
      if (req.body.name && req.body.name !== room.name) {
        const existingRoom = await Room.findOne({
          name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
          _id: { $ne: req.params.id },
        });
        if (existingRoom) {
          return res
            .status(400)
            .json({ message: "Room with this name already exists" });
        }
      }

      // Update room fields
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          room[key] = req.body[key];
        }
      });

      await room.save();
      res.json({
        message: "Room updated successfully",
        room,
      });
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ message: "Server error while updating room" });
    }
  }
);

// Delete room (admin only) - soft delete
router.delete(
  "/:id",
  requireAdmin,
  [param("id").isMongoId().withMessage("Invalid room ID")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const room = await Room.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      // Soft delete by setting isActive to false
      room.isActive = false;
      await room.save();

      res.json({ message: "Room deleted successfully" });
    } catch (error) {
      console.error("Error deleting room:", error);
      res.status(500).json({ message: "Server error while deleting room" });
    }
  }
);

export default router;
