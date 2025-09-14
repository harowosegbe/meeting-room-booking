"use client";

import type React from "react";

import { useState } from "react";
import {
  Button,
  TextField,
  Alert,
  DialogActions,
  Grid,
  Box,
  Typography,
  Snackbar,
} from "@mui/material";
import { createBooking, updateBooking } from "@/api/bookings";

interface Room {
  _id: string;
  name: string;
  capacity: number;
  location: string;
}

interface Booking {
  _id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "cancelled";
  room: {
    _id: string;
    name: string;
    location: string;
    capacity: number;
  };
  attendees: string[];
}

interface BookingFormProps {
  room: Booking["room"];
  onClose: () => void;
  initialData?: Booking;
  onSuccess?: () => void;
}

export function BookingForm({
  room,
  onClose,
  initialData,
  onSuccess,
}: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState(
    initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          date: initialData.startTime.split("T")[0],
          startTime: new Date(initialData.startTime)
            .toISOString()
            .split("T")[1]
            .substring(0, 5),
          endTime: new Date(initialData.endTime)
            .toISOString()
            .split("T")[1]
            .substring(0, 5),
          attendees: initialData.attendees.join(", "),
        }
      : {
          title: "",
          description: "",
          date: "",
          startTime: "",
          endTime: "",
          attendees: "",
        }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Combine date and time for API
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      const attendeesList = formData.attendees
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const opts = {
        room: room._id,
        title: formData.title,
        description: formData.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendees: attendeesList,
      };

      const data = initialData
        ? await updateBooking({
            bookingId: initialData._id,
            ...opts,
          })
        : await createBooking(opts);

      if (!data.booking) {
        throw new Error(data.message || "Booking failed");
      }

      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        attendees: "",
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Box textAlign="center" py={2}>
        <Typography color="success.main" fontWeight={600} variant="h6" mb={1}>
          {initialData
            ? "Booking Updated Successfully!"
            : "Booking Successful!"}
        </Typography>
        <Typography color="text.secondary" mb={2}>
          Your meeting room has been {initialData ? "updated" : "booked"}{" "}
          successfully.
        </Typography>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
        width: 1,
      }}
    >
      <TextField
        label="Meeting Title"
        placeholder="Enter meeting title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
        fullWidth
      />
      <TextField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
        fullWidth
        slotProps={{
          htmlInput: {
            min: new Date().toISOString().split("T")[0],
          },
          inputLabel: {
            shrink: true,
          },
        }}
      />
      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 6,
          }}
        >
          <TextField
            label="Start Time"
            type="time"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
            required
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Grid>
        <Grid
          size={{
            xs: 6,
          }}
        >
          <TextField
            label="End Time"
            type="time"
            value={formData.endTime}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
            required
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Grid>
      </Grid>
      <TextField
        label="Description (Optional)"
        placeholder="Meeting agenda or notes"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        multiline
        rows={3}
        fullWidth
      />
      <TextField
        label="Attendees (Optional)"
        placeholder="Enter email addresses separated by commas"
        value={formData.attendees}
        onChange={(e) =>
          setFormData({ ...formData, attendees: e.target.value })
        }
        fullWidth
      />
      {error && <Alert severity="error">{error}</Alert>}
      <DialogActions>
        <Button
          type="button"
          color="secondary"
          variant="outlined"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={isLoading}>
          {initialData ? "Update Booking" : "Book Room"}
        </Button>
      </DialogActions>
    </Box>
  );
}

export type { Booking };
