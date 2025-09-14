var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// index.ts
var import_mongoose4 = __toESM(require("mongoose"));

// server.ts
var import_express4 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_helmet = __toESM(require("helmet"));
var import_express_rate_limit = __toESM(require("express-rate-limit"));
var import_dotenv = __toESM(require("dotenv"));

// routes/auth.ts
var import_express = __toESM(require("express"));
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var import_express_validator = require("express-validator");

// models/User.ts
var import_mongoose = __toESM(require("mongoose"));
var import_bcryptjs = __toESM(require("bcryptjs"));
var userSchema = new import_mongoose.default.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await import_bcryptjs.default.genSalt(12);
    this.password = await import_bcryptjs.default.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.methods.comparePassword = async function(candidatePassword) {
  return import_bcryptjs.default.compare(candidatePassword, this.password);
};
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};
var UserModel = import_mongoose.default.model("User", userSchema);
var User_default = UserModel;

// middleware/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }
    const decoded = import_jsonwebtoken.default.verify(token, process.env.JWT_SECRET || "secret-key");
    const user = await User_default.findById(decoded.userId).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid token or user not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
var requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// routes/auth.ts
var router = import_express.default.Router();
var generateToken = (userId) => {
  return import_jsonwebtoken2.default.sign({ userId }, process.env.JWT_SECRET || "secret-key", {
    expiresIn: "24h"
  });
};
router.post(
  "/register",
  [
    (0, import_express_validator.body)("email").isEmail().normalizeEmail(),
    (0, import_express_validator.body)("password").isLength({ min: 6 }),
    (0, import_express_validator.body)("firstName").trim().isLength({ min: 1 }),
    (0, import_express_validator.body)("lastName").trim().isLength({ min: 1 })
  ],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password, firstName, lastName } = req.body;
      const existingUser = await User_default.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "User already exists with this email, please login"
        });
      }
      const user = new User_default({
        email,
        password,
        firstName,
        lastName
      });
      await user.save();
      const token = generateToken(user._id.toString());
      res.status(201).json({
        message: "User registered successfully",
        token,
        user: user.toJSON()
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);
router.post(
  "/login",
  [(0, import_express_validator.body)("email").isEmail().normalizeEmail(), (0, import_express_validator.body)("password").exists()],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      const user = await User_default.findOne({ email, isActive: true });
      if (!user) {
        return res.status(401).json({ message: "email or password is incorrect" });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "email or password is incorrect" });
      }
      const token = generateToken(user._id.toString());
      res.json({
        message: "Login successful",
        token,
        user: user.toJSON()
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);
router.get(
  "/me",
  authenticateToken,
  (req, res) => {
    res.json({ user: req.user });
  }
);
router.post(
  "/refresh",
  authenticateToken,
  (req, res) => {
    const token = generateToken(req.user._id.toString());
    res.json({ token });
  }
);
var auth_default = router;

// routes/rooms.ts
var import_express2 = __toESM(require("express"));
var import_express_validator2 = require("express-validator");

// models/Room.ts
var import_mongoose2 = __toESM(require("mongoose"));
var roomSchema = new import_mongoose2.default.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    description: {
      type: String,
      trim: true
    },
    amenities: [
      {
        type: String,
        trim: true
      }
    ],
    location: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
roomSchema.index({ name: 1 });
roomSchema.index({ isActive: 1 });
var RoomModel = import_mongoose2.default.model("Room", roomSchema);
var Room_default = RoomModel;

// routes/rooms.ts
var router2 = import_express2.default.Router();
router2.get("/", async (req, res) => {
  try {
    const { active } = req.query;
    const filter = active === "true" ? { isActive: true } : {};
    const rooms = await Room_default.find(filter).sort({ name: 1 });
    res.json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Server error while fetching rooms" });
  }
});
router2.get(
  "/:id",
  [(0, import_express_validator2.param)("id").isMongoId().withMessage("Invalid room ID")],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator2.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const room = await Room_default.findById(req.params.id);
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
router2.post(
  "/",
  requireAdmin,
  [
    (0, import_express_validator2.body)("name").trim().isLength({ min: 1 }).withMessage("Room name is required"),
    (0, import_express_validator2.body)("capacity").isInt({ min: 1, max: 100 }).withMessage("Capacity must be between 1 and 100"),
    (0, import_express_validator2.body)("location").trim().isLength({ min: 1 }).withMessage("Location is required"),
    (0, import_express_validator2.body)("description").optional().trim(),
    (0, import_express_validator2.body)("amenities").optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator2.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { name, capacity, location, description, amenities } = req.body;
      const existingRoom = await Room_default.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") }
      });
      if (existingRoom) {
        return res.status(400).json({ message: "Room with this name already exists" });
      }
      const room = new Room_default({
        name,
        capacity,
        location,
        description,
        amenities: amenities || []
      });
      await room.save();
      res.status(201).json({
        message: "Room created successfully",
        room
      });
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ message: "Server error while creating room" });
    }
  }
);
router2.put(
  "/:id",
  requireAdmin,
  [
    (0, import_express_validator2.param)("id").isMongoId().withMessage("Invalid room ID"),
    (0, import_express_validator2.body)("name").optional().trim().isLength({ min: 1 }),
    (0, import_express_validator2.body)("capacity").optional().isInt({ min: 1, max: 100 }),
    (0, import_express_validator2.body)("location").optional().trim().isLength({ min: 1 }),
    (0, import_express_validator2.body)("description").optional().trim(),
    (0, import_express_validator2.body)("amenities").optional().isArray(),
    (0, import_express_validator2.body)("isActive").optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator2.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const room = await Room_default.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      if (req.body.name && req.body.name !== room.name) {
        const existingRoom = await Room_default.findOne({
          name: { $regex: new RegExp(`^${req.body.name}$`, "i") },
          _id: { $ne: req.params.id }
        });
        if (existingRoom) {
          return res.status(400).json({ message: "Room with this name already exists" });
        }
      }
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== void 0) {
          room[key] = req.body[key];
        }
      });
      await room.save();
      res.json({
        message: "Room updated successfully",
        room
      });
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ message: "Server error while updating room" });
    }
  }
);
router2.delete(
  "/:id",
  requireAdmin,
  [(0, import_express_validator2.param)("id").isMongoId().withMessage("Invalid room ID")],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator2.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const room = await Room_default.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      room.isActive = false;
      await room.save();
      res.json({ message: "Room deleted successfully" });
    } catch (error) {
      console.error("Error deleting room:", error);
      res.status(500).json({ message: "Server error while deleting room" });
    }
  }
);
var rooms_default = router2;

// routes/bookings.ts
var import_express3 = __toESM(require("express"));
var import_express_validator3 = require("express-validator");

// models/Booking.ts
var import_mongoose3 = __toESM(require("mongoose"));
var bookingSchema = new import_mongoose3.default.Schema(
  {
    room: {
      type: import_mongoose3.default.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    user: {
      type: import_mongoose3.default.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed"
    },
    attendees: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);
bookingSchema.pre("save", function(next) {
  const duration = (this.endTime.getTime() - this.startTime.getTime()) / (1e3 * 60 * 60);
  if (duration > 4) {
    return next(new Error("Booking duration cannot exceed 4 hours"));
  }
  if (this.startTime >= this.endTime) {
    return next(new Error("End time must be after start time"));
  }
  next();
});
bookingSchema.index({ room: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, startTime: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });
var BookingModel = import_mongoose3.default.model("Booking", bookingSchema);
var Booking_default = BookingModel;

// routes/bookings.ts
var router3 = import_express3.default.Router();
var checkBookingConflict = async (roomId, startTime, endTime, excludeBookingId = null) => {
  const conflictQuery = {
    room: roomId,
    status: "confirmed",
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };
  if (excludeBookingId) {
    conflictQuery["_id"] = { $ne: excludeBookingId };
  }
  const conflictingBooking = await Booking_default.findOne(conflictQuery);
  return conflictingBooking;
};
router3.get(
  "/",
  authenticateToken,
  [
    (0, import_express_validator3.query)("room").optional().isMongoId(),
    (0, import_express_validator3.query)("date").optional().isISO8601(),
    (0, import_express_validator3.query)("status").optional().isIn(["confirmed", "cancelled"])
  ],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator3.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { room, date, status, all } = req.query;
      const filter = {};
      if (req.user.role !== "admin" || all !== "true") {
        filter["user"] = req.user._id;
      }
      if (room) filter["room"] = room;
      if (status) filter["status"] = status;
      if (date) {
        const startOfDay = new Date(date.toString());
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date.toString());
        endOfDay.setHours(23, 59, 59, 999);
        filter["startTime"] = { $gte: startOfDay, $lte: endOfDay };
      }
      const bookings = await Booking_default.find(filter).populate("room", "name location capacity").populate("user", "firstName lastName email").sort({ createdAt: -1 });
      res.json({ bookings });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Server error while fetching bookings" });
    }
  }
);
router3.get(
  "/:id",
  authenticateToken,
  [(0, import_express_validator3.param)("id").isMongoId().withMessage("Invalid booking ID")],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator3.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const filter = { _id: req.params.id };
      if (req.user.role !== "admin") {
        filter["user"] = req.user._id;
      }
      const booking = await Booking_default.findOne(filter).populate("room", "name location capacity amenities").populate("user", "firstName lastName email");
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
router3.post(
  "/",
  authenticateToken,
  [
    (0, import_express_validator3.body)("room").isMongoId().withMessage("Valid room ID is required"),
    (0, import_express_validator3.body)("title").trim().isLength({ min: 1 }).withMessage("Meeting title is required"),
    (0, import_express_validator3.body)("startTime").isISO8601().withMessage("Valid start time is required"),
    (0, import_express_validator3.body)("endTime").isISO8601().withMessage("Valid end time is required"),
    (0, import_express_validator3.body)("description").optional().trim(),
    (0, import_express_validator3.body)("attendees").optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator3.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        room: roomId,
        title,
        startTime,
        endTime,
        description,
        attendees
      } = req.body;
      const start = new Date(startTime);
      const end = new Date(endTime);
      const now = /* @__PURE__ */ new Date();
      if (start <= now) {
        return res.status(400).json({ message: "Booking must be in the future" });
      }
      if (start >= end) {
        return res.status(400).json({ message: "End time must be after start time" });
      }
      const duration = (end.getTime() - start.getTime()) / (1e3 * 60 * 60);
      if (duration > 4) {
        return res.status(400).json({ message: "Booking duration cannot exceed 4 hours" });
      }
      const room = await Room_default.findOne({ _id: roomId, isActive: true });
      if (!room) {
        return res.status(404).json({ message: "Room not found or not available" });
      }
      const conflict = await checkBookingConflict(roomId, start, end);
      if (conflict) {
        return res.status(409).json({
          message: "Room is already booked for this time slot",
          conflictingBooking: {
            startTime: conflict.startTime,
            endTime: conflict.endTime,
            title: conflict.title
          }
        });
      }
      const booking = new Booking_default({
        room: roomId,
        user: req.user._id,
        title,
        startTime: start,
        endTime: end,
        description,
        attendees: attendees || []
      });
      await booking.save();
      await booking.populate("room", "name location capacity");
      res.status(201).json({
        message: "Booking created successfully",
        booking
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Server error while creating booking" });
    }
  }
);
router3.put(
  "/:id",
  authenticateToken,
  [
    (0, import_express_validator3.param)("id").isMongoId().withMessage("Invalid booking ID"),
    (0, import_express_validator3.body)("title").optional().trim().isLength({ min: 1 }),
    (0, import_express_validator3.body)("startTime").optional().isISO8601(),
    (0, import_express_validator3.body)("endTime").optional().isISO8601(),
    (0, import_express_validator3.body)("description").optional().trim(),
    (0, import_express_validator3.body)("attendees").optional().isArray()
  ],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator3.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const filter = { _id: req.params.id, status: "confirmed" };
      if (req.user.role !== "admin") {
        filter["user"] = req.user._id;
      }
      const booking = await Booking_default.findOne(filter);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found or cannot be modified" });
      }
      const newStartTime = req.body.startTime ? new Date(req.body.startTime) : booking.startTime;
      const newEndTime = req.body.endTime ? new Date(req.body.endTime) : booking.endTime;
      if (req.body.startTime || req.body.endTime) {
        const now = /* @__PURE__ */ new Date();
        if (newStartTime <= now) {
          return res.status(400).json({ message: "Booking must be in the future" });
        }
        if (newStartTime >= newEndTime) {
          return res.status(400).json({ message: "End time must be after start time" });
        }
        const duration = (newEndTime.getTime() - newStartTime.getTime()) / (1e3 * 60 * 60);
        if (duration > 4) {
          return res.status(400).json({ message: "Booking duration cannot exceed 4 hours" });
        }
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
              title: conflict.title
            }
          });
        }
      }
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== void 0) {
          booking[key] = req.body[key];
        }
      });
      await booking.save();
      await booking.populate("room", "name location capacity");
      res.json({
        message: "Booking updated successfully",
        booking
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Server error while updating booking" });
    }
  }
);
router3.delete(
  "/:id",
  authenticateToken,
  [(0, import_express_validator3.param)("id").isMongoId().withMessage("Invalid booking ID")],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator3.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const filter = { _id: req.params.id, status: "confirmed" };
      if (req.user.role !== "admin") {
        filter["user"] = req.user._id;
      }
      const booking = await Booking_default.findOne(filter);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found or already cancelled" });
      }
      booking.status = "cancelled";
      await booking.save();
      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Server error while cancelling booking" });
    }
  }
);
router3.get(
  "/availability/:roomId",
  authenticateToken,
  [
    (0, import_express_validator3.param)("roomId").isMongoId().withMessage("Invalid room ID"),
    (0, import_express_validator3.query)("date").isISO8601().withMessage("Valid date is required")
  ],
  async (req, res) => {
    try {
      const errors = (0, import_express_validator3.validationResult)(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { roomId } = req.params;
      const { date } = req.query;
      const room = await Room_default.findOne({ _id: roomId, isActive: true });
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      const startOfDay = new Date(date.toString());
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date.toString());
      endOfDay.setHours(23, 59, 59, 999);
      const bookings = await Booking_default.find({
        room: roomId,
        status: "confirmed",
        startTime: { $gte: startOfDay, $lte: endOfDay }
      }).sort({ startTime: 1 });
      res.json({
        room: {
          id: room._id,
          name: room.name,
          capacity: room.capacity,
          location: room.location
        },
        date,
        bookings: bookings.map((booking) => ({
          id: booking._id,
          title: booking.title,
          startTime: booking.startTime,
          endTime: booking.endTime,
          user: booking.user
        }))
      });
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Server error while fetching availability" });
    }
  }
);
var bookings_default = router3;

// server.ts
import_dotenv.default.config();
var app = (0, import_express4.default)();
app.use((0, import_helmet.default)());
app.use(
  (0, import_cors.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  })
);
var limiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100
  // limit each IP to 100 requests per windowMs
});
app.use(limiter);
app.use(import_express4.default.json({ limit: "10mb" }));
app.use(import_express4.default.urlencoded({ extended: true }));
app.use("/api/users", auth_default);
app.use("/api/rooms", authenticateToken, rooms_default);
app.use("/api/bookings", authenticateToken, bookings_default);
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.use(
  (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Something went wrong!",
      error: process.env.NODE_ENV === "development" ? err.message : {}
    });
  }
);
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});
var server_default = app;

// index.ts
var PORT = process.env.PORT || 5e3;
(async () => {
  import_mongoose4.default.connect(process.env.MONGODB_URI).then(() => console.log("Connected to MongoDB")).catch((err) => console.error("MongoDB connection error:", err));
  server_default.listen(PORT, () => console.log(`API running on port ${PORT}`));
})();
//# sourceMappingURL=index.js.map