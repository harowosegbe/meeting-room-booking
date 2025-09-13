import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
    attendees: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Validate booking duration (max 4 hours)
bookingSchema.pre("save", function (next) {
  const duration = (this.endTime - this.startTime) / (1000 * 60 * 60); // hours
  if (duration > 4) {
    return next(new Error("Booking duration cannot exceed 4 hours"));
  }
  if (this.startTime >= this.endTime) {
    return next(new Error("End time must be after start time"));
  }
  next();
});

// Indexes for efficient queries
bookingSchema.index({ room: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, startTime: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });

const BookingModel = mongoose.model("Booking", bookingSchema);
export default BookingModel;

