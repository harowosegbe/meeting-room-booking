"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  CardMedia,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Box,
  Grid,
  Stack,
  Skeleton,
  Badge as MuiBadge,
  IconButton,
} from "@mui/material";
import {
  People as UsersIcon,
  LocationOn as MapPinIcon,
  Wifi as WifiIcon,
  Monitor as MonitorIcon,
  Coffee as CoffeeIcon,
} from "@mui/icons-material";
import { BookingForm } from "./booking-form";
import { getRooms } from "@/api/rooms";
import { toast } from "react-toastify";

interface Room {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  description?: string;
  amenities: string[];
  isActive: boolean;
}

export function RoomGrid() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await getRooms({
        active: "true",
      });
      setRooms(data.rooms);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch rooms");
    } finally {
      setIsLoading(false);
    }
  };

  const dialogMarkup = (
    <Dialog
      open={Boolean(selectedRoom)}
      onClose={() => setSelectedRoom(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Book {selectedRoom?.name}</DialogTitle>
      <DialogContent>
        <DialogContentText mb={2}>
          Schedule a meeting in this room
        </DialogContentText>
        {selectedRoom && (
          <BookingForm
            room={selectedRoom}
            onClose={() => setSelectedRoom(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[...Array(6)].map((_, i) => (
          <Grid
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
            key={i}
          >
            <Card>
              <CardHeader>
                <Skeleton variant="text" width="75%" height={32} />
                <Skeleton variant="text" width="50%" height={24} />
              </CardHeader>
              <CardContent>
                <Skeleton variant="rectangular" height={80} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {rooms.map((room) => (
        <RoomCard
          key={room._id}
          room={room}
          setSelectedRoom={setSelectedRoom}
        />
      ))}

      {dialogMarkup}
    </Grid>
  );
}

function RoomCard({
  room,
  setSelectedRoom,
}: {
  room: Room;
  setSelectedRoom: (room: Room | null) => void;
}) {
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <WifiIcon fontSize="small" />;
      case "projector":
      case "screen":
        return <MonitorIcon fontSize="small" />;
      case "coffee":
        return <CoffeeIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Grid
      size={{
        xs: 12,
        md: 6,
        lg: 4,
      }}
      key={room._id}
      sx={{ display: "flex" }}
    >
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: 250,
          transition: "box-shadow 0.2s",
          "&:hover": { boxShadow: 6 },
        }}
      >
        <CardHeader
          title={
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="h6">{room.name}</Typography>
              <Chip
                icon={<UsersIcon fontSize="small" />}
                label={room.capacity}
                size="small"
                color="secondary"
              />
            </Stack>
          }
          subheader={
            <Stack direction="row" alignItems="center" spacing={1}>
              <MapPinIcon fontSize="small" />
              <Typography variant="body2">{room.location}</Typography>
            </Stack>
          }
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {room.description && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              {room.description}
            </Typography>
          )}
          {room.amenities.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
              {room.amenities.map((amenity, index) => (
                <Chip
                  key={index}
                  icon={getAmenityIcon(amenity) || undefined}
                  label={amenity}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          )}
          <Box sx={{ mt: "auto" }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setSelectedRoom(room)}
            >
              Book Room
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}
