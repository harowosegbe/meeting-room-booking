"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Button,
  Alert,
  Skeleton,
  Box,
  Stack,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  AccessTime as ClockIcon,
  Edit,
  LocationOn as MapPinIcon,
  People as UsersIcon,
  Close as XIcon,
} from "@mui/icons-material";
import { cancelBooking, getBookings } from "@/api/bookings";
import { toast } from "react-toastify";
import { MoreOptions } from "@/components/ui/more-options";
import { BookingForm, Booking } from "./booking-form";

export function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getBookings({
        all: false,
      });

      if (!data.bookings) {
        throw new Error("No bookings found");
      }

      setBookings(data.bookings);
    } catch (error) {
      toast.error((error as Error).message || "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setUpdating(bookingId);
      const data = await cancelBooking(bookingId);

      setBookings(
        bookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: "cancelled" }
            : booking
        )
      );

      toast.success("Booking cancelled successfully");
    } catch (error) {
      toast.error((error as Error).message || "Failed to cancel booking");
    } finally {
      setUpdating(null);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  const dialogMarkup = (
    <Dialog
      open={Boolean(selectedBooking)}
      onClose={() => setSelectedBooking(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Update {selectedBooking?.room.name} Booking</DialogTitle>
      <DialogContent>
        <DialogContentText mb={2}>
          Schedule a meeting in this room
        </DialogContentText>
        {selectedBooking?.room && (
          <BookingForm
            room={selectedBooking?.room}
            onClose={() => setSelectedBooking(null)}
            initialData={selectedBooking || undefined}
            onSuccess={() => {
              fetchBookings();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <Stack spacing={2}>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton variant="text" width="75%" height={32} />
              <Skeleton variant="text" width="50%" height={24} />
            </CardHeader>
            <CardContent>
              <Skeleton variant="rectangular" height={64} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  if (bookings.length === 0) {
    return (
      <Box textAlign="center" py={6}>
        <CalendarIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" mb={1}>
          No bookings yet
        </Typography>
        <Typography color="text.secondary">
          Start by booking a meeting room from the Rooms tab.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {bookings.map((booking) => {
        const startDateTime = formatDateTime(booking.startTime);
        const endDateTime = formatDateTime(booking.endTime);
        const upcoming = isUpcoming(booking.startTime);
        return (
          <Card
            key={booking._id}
            sx={booking.status === "cancelled" ? { opacity: 0.6 } : {}}
          >
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h6" fontSize={16}>
                    {booking.title}
                  </Typography>
                  <Chip
                    label={booking.status}
                    color={
                      booking.status === "confirmed" ? "success" : "default"
                    }
                    size="small"
                  />
                </Stack>
              }
              subheader={
                <Stack direction="row" spacing={4} mt={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <MapPinIcon fontSize="small" />
                    <Typography variant="body2">
                      {booking.room.name} - {booking.room.location}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <UsersIcon fontSize="small" />
                    <Typography variant="body2">
                      {booking.room.capacity} capacity
                    </Typography>
                  </Stack>
                </Stack>
              }
              action={
                <MoreOptions
                  config={[
                    {
                      label: "Edit",
                      onClick: () => handleEditBooking(booking),
                      disabled:
                        booking.status !== "confirmed" ||
                        updating === booking._id,
                    },
                    {
                      label: "Cancel",
                      onClick: () => handleCancelBooking(booking._id),
                      disabled:
                        booking.status !== "confirmed" ||
                        !isUpcoming(booking.startTime) ||
                        updating === booking._id,
                    },
                  ]}
                />
              }
            />
            <CardContent>
              <Stack direction="row" spacing={4} mb={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CalendarIcon fontSize="small" />
                  <Typography variant="body2">{startDateTime.date}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <ClockIcon fontSize="small" />
                  <Typography variant="body2">
                    {startDateTime.time} - {endDateTime.time}
                  </Typography>
                </Stack>
              </Stack>
              {booking.description && (
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {booking.description}
                </Typography>
              )}
              {booking.attendees.length > 0 && (
                <Typography variant="body2">
                  <b>Attendees:</b> {booking.attendees.join(", ")}
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}

      {dialogMarkup}
    </Stack>
  );
}
