import request from "supertest";
import app from "../server";
import User from "../models/User";
import Room from "../models/Room";
import Booking from "../models/Booking";

describe("Booking Endpoints", () => {
  let userToken;
  let userId;
  let testRoom;

  beforeEach(async () => {
    // Create test user
    const userResponse = await request(app).post("/api/users/register").send({
      email: "user@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
    userToken = userResponse.body.token;
    userId = userResponse.body.user._id;

    // Create test room
    testRoom = new Room({
      name: "Test Room",
      capacity: 10,
      location: "Test Location",
      amenities: ["WiFi"],
    });
    await testRoom.save();
  });

  describe("POST /api/bookings", () => {
    it("should create booking with valid data", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(12, 0, 0, 0);

      const bookingData = {
        room: testRoom._id,
        title: "Test Meeting",
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        description: "Test Description",
      };

      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body).toHaveProperty("booking");
      expect(response.body.booking.title).toBe(bookingData.title);
      expect(response.body.booking.room._id).toBe(testRoom._id.toString());
    });

    it("should not create booking in the past", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const bookingData = {
        room: testRoom._id,
        title: "Test Meeting",
        startTime: yesterday.toISOString(),
        endTime: new Date().toISOString(),
      };

      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.message).toContain("must be in the future");
    });

    it("should not create booking longer than 4 hours", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(15, 0, 0, 0); // 5 hours later

      const bookingData = {
        room: testRoom._id,
        title: "Test Meeting",
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
      };

      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.message).toContain("cannot exceed 4 hours");
    });

    it("should not create conflicting booking", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(12, 0, 0, 0);

      // Create first booking
      const existingBooking = new Booking({
        room: testRoom._id,
        user: userId,
        title: "Existing Meeting",
        startTime: tomorrow,
        endTime: endTime,
      });
      await existingBooking.save();

      // Try to create conflicting booking
      const bookingData = {
        room: testRoom._id,
        title: "Conflicting Meeting",
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
      };

      const response = await request(app)
        .post("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .send(bookingData)
        .expect(409);

      expect(response.body.message).toContain("already booked");
    });
  });

  describe("GET /api/bookings", () => {
    let testBooking;

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(12, 0, 0, 0);

      testBooking = new Booking({
        room: testRoom._id,
        user: userId,
        title: "Test Meeting",
        startTime: tomorrow,
        endTime: endTime,
      });
      await testBooking.save();
    });

    it("should get user bookings", async () => {
      const response = await request(app)
        .get("/api/bookings")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("bookings");
      expect(Array.isArray(response.body.bookings)).toBe(true);
      expect(response.body.bookings.length).toBe(1);
      expect(response.body.bookings[0].title).toBe("Test Meeting");
    });

    it("should not get bookings without authentication", async () => {
      const response = await request(app).get("/api/bookings").expect(401);

      expect(response.body.message).toContain("Access token required");
    });
  });

  describe("DELETE /api/bookings/:id", () => {
    let testBooking;

    beforeEach(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(12, 0, 0, 0);

      testBooking = new Booking({
        room: testRoom._id,
        user: userId,
        title: "Test Meeting",
        startTime: tomorrow,
        endTime: endTime,
      });
      await testBooking.save();
    });

    it("should cancel own booking", async () => {
      const response = await request(app)
        .delete(`/api/bookings/${testBooking._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toContain("cancelled successfully");

      // Verify booking is cancelled
      const booking = await Booking.findById(testBooking._id);
      expect(booking.status).toBe("cancelled");
    });

    it("should not cancel non-existent booking", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/bookings/${fakeId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.message).toContain("not found");
    });
  });

  describe("GET /api/bookings/availability/:roomId", () => {
    it("should get room availability", async () => {
      const today = new Date().toISOString().split("T")[0];

      const response = await request(app)
        .get(`/api/bookings/availability/${testRoom._id}`)
        .query({ date: today })
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("room");
      expect(response.body).toHaveProperty("bookings");
      expect(response.body.room.name).toBe("Test Room");
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });

    it("should not get availability for non-existent room", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const today = new Date().toISOString().split("T")[0];

      const response = await request(app)
        .get(`/api/bookings/availability/${fakeId}`)
        .query({ date: today })
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.message).toContain("Room not found");
    });
  });
});
