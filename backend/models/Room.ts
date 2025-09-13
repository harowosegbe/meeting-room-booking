import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    description: {
      type: String,
      trim: true,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
roomSchema.index({ name: 1 });
roomSchema.index({ isActive: 1 });

const RoomModel = mongoose.model("Room", roomSchema);
export default RoomModel;

