// MongoDB initialization script
const db = db.getSiblingDB("meeting-rooms")

// Create collections
db.createCollection("users")
db.createCollection("rooms")
db.createCollection("bookings")

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true })
db.rooms.createIndex({ name: 1 }, { unique: true })
db.rooms.createIndex({ isActive: 1 })
db.bookings.createIndex({ room: 1, startTime: 1, endTime: 1 })
db.bookings.createIndex({ user: 1, startTime: 1 })
db.bookings.createIndex({ startTime: 1, endTime: 1 })

// Insert sample admin user (password: admin123)
db.users.insertOne({
  email: "admin@meetingrooms.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5KS", // admin123
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
})

// Insert sample rooms
db.rooms.insertMany([
  {
    name: "Conference Room A",
    capacity: 10,
    location: "Floor 1, East Wing",
    description: "Large conference room with projector and whiteboard",
    amenities: ["Projector", "Whiteboard", "WiFi", "Conference Phone"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Meeting Room B",
    capacity: 6,
    location: "Floor 2, West Wing",
    description: "Medium meeting room perfect for team meetings",
    amenities: ["TV Screen", "WiFi", "Whiteboard"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Small Meeting Room C",
    capacity: 4,
    location: "Floor 1, Central",
    description: "Cozy room for small team discussions",
    amenities: ["WiFi", "Whiteboard"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
])

print("Database initialized with sample data")
