"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  Apartment as BuildingIcon,
} from "@mui/icons-material";
import { createRoom, getRooms, updateRoom } from "@/api/rooms";
import { toast } from "react-toastify";
import { cancelBooking, getBookings } from "@/api/bookings";
import { MoreOptions } from "../ui/more-options";

interface Room {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  description?: string;
  amenities: string[];
  isActive: boolean;
  createdAt: string;
}

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
}

interface Booking {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "cancelled";
  room: {
    name: string;
    location: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

function LoadingIndicator() {
  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">
          <Skeleton width={180} />
        </Typography>
        <Skeleton variant="rectangular" height={40} width="100%" />
        <Skeleton variant="rectangular" height={200} width="100%" />
      </Stack>
    </Box>
  );
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [openRoomDialog, setOpenRoomDialog] = useState(false);

  useEffect(() => {
    if (activeTab === 0) {
      fetchRooms();
    } else if (activeTab === 1) {
      fetchAllBookings();
    }
  }, [activeTab]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const data = await getRooms({
        active: "false",
      });

      if (!data || !data.rooms) {
        throw new Error("No rooms data received");
      }

      if (data.rooms) {
        setRooms(data.rooms);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    try {
      setIsLoading(true);
      const data = await getBookings({
        all: true,
      });

      if (!data || !data.bookings) {
        throw new Error("No bookings data received");
      }

      setBookings(data.bookings);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        aria-label="admin panel tabs"
      >
        <Tab
          icon={<BuildingIcon fontSize="small" />}
          label="Rooms"
          iconPosition="start"
        />
        <Tab
          icon={<CalendarIcon fontSize="small" />}
          label="All Bookings"
          iconPosition="start"
        />
      </Tabs>

      {isLoading && <LoadingIndicator />}
      {!isLoading && (
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Room Management</Typography>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenRoomDialog(true)}
                >
                  Add Room
                </Button>

                <RoomDialog
                  onRoomAdded={fetchRooms}
                  open={openRoomDialog}
                  onClose={() => setOpenRoomDialog(false)}
                />
              </Stack>
              <RoomManagement rooms={rooms} onRoomUpdated={fetchRooms} />
            </Box>
          )}
          {activeTab === 1 && (
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">All Bookings</Typography>
              </Stack>
              <BookingManagement
                bookings={bookings}
                onBookingUpdated={fetchAllBookings}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function RoomDialog({
  onRoomAdded,
  initialData,
  open,
  onClose,
}: {
  onRoomAdded: () => void;
  initialData?: Room;
  open: boolean;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(
    initialData
      ? {
          ...initialData,
          capacity: initialData.capacity.toString(),
          amenities: initialData.amenities.join(", "),
        }
      : {
          name: "",
          capacity: "",
          location: "",
          description: "",
          amenities: "",
        }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const opts = {
        ...formData,
        capacity: Number.parseInt(formData.capacity),
        amenities: formData.amenities
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
      };

      const data = initialData
        ? await updateRoom({
            ...opts,
            roomId: initialData._id,
          })
        : await createRoom(opts);

      if (!data.room) {
        throw new Error("No room data received");
      }

      onClose();
      setFormData({
        name: "",
        capacity: "",
        location: "",
        description: "",
        amenities: "",
      });
      onRoomAdded();
      toast.success(
        initialData ? "Room updated successfully" : "Room created successfully"
      );
    } catch (error: any) {
      setError("Network error. Please try again.");
      toast.error(error.message || "Failed to create/update room.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add New Room</DialogTitle>
        <DialogContent>
          <DialogContentText mb={2}>
            Create a new meeting room for booking
          </DialogContentText>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label="Room Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  slotProps={{
                    htmlInput: { min: 1, max: 100 },
                  }}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Amenities (comma-separated)"
              placeholder="WiFi, Projector, Whiteboard"
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
              fullWidth
            />
            {error && <Alert severity="error">{error}</Alert>}
            <DialogActions>
              <Button onClick={onClose} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button type="submit" variant="contained" loading={isLoading}>
                {initialData ? "Update Room" : "Create Room"}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RoomManagement({
  rooms,
  onRoomUpdated,
}: {
  rooms: Room[];
  onRoomUpdated: () => void;
}) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleRoomStatus = async (roomId: string, isActive: boolean) => {
    try {
      setUpdating(roomId);

      const newState = !isActive;
      const data = await updateRoom({
        roomId,
        isActive: newState,
      });

      if (!data.room) {
        throw new Error("No room data received");
      }

      onRoomUpdated();
      toast.success(
        newState
          ? "Room activated successfully"
          : "Room deactivated successfully"
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to update room status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <b>Name</b>
            </TableCell>
            <TableCell>
              <b>Location</b>
            </TableCell>
            <TableCell>
              <b>Capacity</b>
            </TableCell>
            <TableCell>
              <b>Status</b>
            </TableCell>
            <TableCell>
              <b>Amenities</b>
            </TableCell>
            <TableCell>
              <b>Actions</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room._id}>
              <TableCell>{room.name}</TableCell>
              <TableCell>{room.location}</TableCell>
              <TableCell>{room.capacity}</TableCell>
              <TableCell>
                <Chip
                  label={room.isActive ? "Active" : "Inactive"}
                  color={room.isActive ? "success" : "default"}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {room.amenities.slice(0, 2).map((amenity, index) => (
                    <Chip
                      key={index}
                      label={amenity}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {room.amenities.length > 2 && (
                    <Chip
                      label={`+${room.amenities.length - 2}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                <MoreOptions
                  config={[
                    {
                      label: "Edit",
                      onClick: () => setSelectedRoom(room),
                      disabled: updating === room._id,
                    },
                    {
                      label: room.isActive ? "Deactivate" : "Activate",
                      onClick: () => toggleRoomStatus(room._id, room.isActive),
                      disabled: updating === room._id,
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedRoom && (
        <RoomDialog
          onRoomAdded={onRoomUpdated}
          open={Boolean(selectedRoom)}
          onClose={() => setSelectedRoom(null)}
          initialData={selectedRoom || undefined}
        />
      )}
    </TableContainer>
  );
}

function BookingManagement({
  bookings,
  onBookingUpdated,
}: {
  bookings: Booking[];
  onBookingUpdated: () => void;
}) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setUpdating(bookingId);
      const data = await cancelBooking(bookingId);

      toast.success("Booking cancelled successfully");
      onBookingUpdated();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking");
    } finally {
      setUpdating(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <b>Meeting</b>
            </TableCell>
            <TableCell>
              <b>Room</b>
            </TableCell>
            <TableCell>
              <b>User</b>
            </TableCell>
            <TableCell>
              <b>Date & Time</b>
            </TableCell>
            <TableCell>
              <b>Status</b>
            </TableCell>
            <TableCell>
              <b>Actions</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => {
            const startDateTime = formatDateTime(booking.startTime);
            const endDateTime = formatDateTime(booking.endTime);
            return (
              <TableRow key={booking._id}>
                <TableCell>{booking.title}</TableCell>
                <TableCell>
                  {booking.room.name}
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {booking.room.location}
                  </Typography>
                </TableCell>
                <TableCell>
                  {booking.user.firstName} {booking.user.lastName}
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {booking.user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  {startDateTime.date}
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    {startDateTime.time} - {endDateTime.time}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={booking.status}
                    color={
                      booking.status === "confirmed" ? "success" : "default"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {booking.status === "confirmed" && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={() => handleCancelBooking(booking._id)}
                      loading={updating === booking._id}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
