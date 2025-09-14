# Meeting Room Booking System

A full-stack meeting room booking system built with Express.js, MongoDB, and Next.js.

## Features

- **User Authentication**: Login and registration with JWT tokens
- **Room Management**: Browse available meeting rooms with details
- **Booking System**: Book rooms with time constraints (max 4 hours)
- **Admin Panel**: Manage rooms, users, and bookings
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Express.js, MongoDB, JWT Authentication
- **Frontend**: Next.js, React, Material UI
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Default Admin Account

- Email: admin@meetingrooms.com
- Password: admin123

## Local Development

### Backend Setup

\`\`\`bash
cd backend
yarn install
yarn run dev
\`\`\`

### Frontend Setup

\`\`\`bash
cd frontend
yarn install
yarn run dev
\`\`\`

### Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend (.env):**
\`\`\`
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/meeting-rooms
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
\`\`\`

**Frontend (.env.local):**
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

## API Endpoints

### Authentication

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user

### Rooms

- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)

### Bookings

- `GET /api/bookings` - Get user bookings (or all for admin)
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/availability/:roomId` - Check room availability

## Testing

Integration tests are included for API endpoints:

\`\`\`bash
cd backend
npm test
\`\`\`

## Project Structure

\`\`\`
meeting-room-booking/
├── backend/
│ ├── models/ # MongoDB models
│ ├── routes/ # API routes
│ ├── middleware/ # Authentication middleware
│ ├── tests/ # Integration tests
│ └── server.ts # Express server
├── frontend/
│ ├── app/ # Next.js app directory
│ ├── components/ # React components
│ └── lib/ # Utility functions
└── README.md
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
