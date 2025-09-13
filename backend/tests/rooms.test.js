const request = require("supertest")
const app = require("../server")
const User = require("../models/User")
const Room = require("../models/Room")

describe("Room Endpoints", () => {
  let userToken
  let adminToken
  let testRoom

  beforeEach(async () => {
    // Create regular user
    const userResponse = await request(app).post("/api/auth/register").send({
      email: "user@example.com",
      password: "password123",
      firstName: "Regular",
      lastName: "User",
    })
    userToken = userResponse.body.token

    // Create admin user
    const admin = new User({
      email: "admin@example.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    })
    await admin.save()

    const adminResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    })
    adminToken = adminResponse.body.token

    // Create test room
    testRoom = new Room({
      name: "Test Room",
      capacity: 10,
      location: "Test Location",
      description: "Test Description",
      amenities: ["WiFi", "Projector"],
    })
    await testRoom.save()
  })

  describe("GET /api/rooms", () => {
    it("should get all active rooms for authenticated user", async () => {
      const response = await request(app).get("/api/rooms").set("Authorization", `Bearer ${userToken}`).expect(200)

      expect(response.body).toHaveProperty("rooms")
      expect(Array.isArray(response.body.rooms)).toBe(true)
      expect(response.body.rooms.length).toBe(1)
      expect(response.body.rooms[0].name).toBe("Test Room")
    })

    it("should not get rooms without authentication", async () => {
      const response = await request(app).get("/api/rooms").expect(401)

      expect(response.body.message).toContain("Access token required")
    })
  })

  describe("POST /api/rooms", () => {
    it("should create room as admin", async () => {
      const roomData = {
        name: "New Room",
        capacity: 8,
        location: "New Location",
        description: "New Description",
        amenities: ["WiFi"],
      }

      const response = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(roomData)
        .expect(201)

      expect(response.body).toHaveProperty("room")
      expect(response.body.room.name).toBe(roomData.name)
      expect(response.body.room.capacity).toBe(roomData.capacity)
    })

    it("should not create room as regular user", async () => {
      const roomData = {
        name: "New Room",
        capacity: 8,
        location: "New Location",
      }

      const response = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${userToken}`)
        .send(roomData)
        .expect(403)

      expect(response.body.message).toContain("Admin access required")
    })

    it("should not create room with invalid data", async () => {
      const roomData = {
        name: "",
        capacity: 0,
        location: "",
      }

      const response = await request(app)
        .post("/api/rooms")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(roomData)
        .expect(400)

      expect(response.body).toHaveProperty("errors")
    })
  })

  describe("PUT /api/rooms/:id", () => {
    it("should update room as admin", async () => {
      const updateData = {
        name: "Updated Room",
        capacity: 12,
      }

      const response = await request(app)
        .put(`/api/rooms/${testRoom._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.room.name).toBe(updateData.name)
      expect(response.body.room.capacity).toBe(updateData.capacity)
    })

    it("should not update room as regular user", async () => {
      const updateData = {
        name: "Updated Room",
      }

      const response = await request(app)
        .put(`/api/rooms/${testRoom._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send(updateData)
        .expect(403)

      expect(response.body.message).toContain("Admin access required")
    })
  })

  describe("DELETE /api/rooms/:id", () => {
    it("should soft delete room as admin", async () => {
      const response = await request(app)
        .delete(`/api/rooms/${testRoom._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)

      expect(response.body.message).toContain("deleted successfully")

      // Verify room is soft deleted
      const room = await Room.findById(testRoom._id)
      expect(room.isActive).toBe(false)
    })

    it("should not delete room as regular user", async () => {
      const response = await request(app)
        .delete(`/api/rooms/${testRoom._id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403)

      expect(response.body.message).toContain("Admin access required")
    })
  })
})
