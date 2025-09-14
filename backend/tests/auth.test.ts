import request from "supertest";
import app from "../server";
import User from "../models/User";

describe("Authentication Endpoints", () => {
  describe("POST /api/users/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe("user");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should not register user with invalid email", async () => {
      const userData = {
        email: "invalid-email",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should not register user with short password", async () => {
      const userData = {
        email: "test@example.com",
        password: "123",
        firstName: "John",
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("errors");
    });

    it("should not register user with duplicate email", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };

      // Register first user
      await request(app).post("/api/users/register").send(userData).expect(201);

      // Try to register with same email
      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain("already exists");
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      });
      await user.save();
    });

    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(loginData.email);
    });

    it("should not login with invalid email", async () => {
      const loginData = {
        email: "wrong@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(401);

      expect(response.body.message).toContain("email or password is incorrect");
    });

    it("should not login with invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/users/login")
        .send(loginData)
        .expect(401);

      expect(response.body.message).toContain("email or password is incorrect");
    });
  });

  describe("GET /api/users/me", () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Create and login a test user
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData);

      token = response.body.token;
      userId = response.body.user._id;
    });

    it("should get current user with valid token", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.user._id).toBe(userId);
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should not get user without token", async () => {
      const response = await request(app).get("/api/users/me").expect(401);

      expect(response.body.message).toContain("Access token required");
    });

    it("should not get user with invalid token", async () => {
      const response = await request(app)
        .get("/api/users/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(403);

      expect(response.body.message).toContain("Invalid or expired token");
    });
  });
});
