import mongoose from "mongoose";
import app from "./server";

const PORT = process.env.PORT || 5000;

(async () => {
  mongoose
    .connect(process.env.MONGODB_URI!)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
})();
