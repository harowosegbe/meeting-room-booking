"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Container,
  Tabs,
  Tab,
  Card,
  CardContent,
  CircularProgress,
  Stack,
} from "@mui/material";
import { LogOut, Calendar, Users, Settings } from "lucide-react";
import { RoomGrid } from "./room-grid";
import { BookingList } from "./booking-list";
import { AdminPanel } from "./admin-panel";
import { useAuth } from "@/providers/auth";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <Stack
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </Stack>
  );
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = () => {
    logout();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const roomsMarkup = (
    <TabPanel value={activeTab} index={0}>
      <Card>
        <CardContent>
          <Typography variant="h6" fontSize={18} gutterBottom>
            Available Meeting Rooms
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Browse and book available meeting rooms for your team
          </Typography>
          <RoomGrid />
        </CardContent>
      </Card>
    </TabPanel>
  );

  const bookingsMarkup = (
    <TabPanel value={activeTab} index={1}>
      <Card>
        <CardContent>
          <Typography variant="h6" fontSize={18} gutterBottom>
            My Bookings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            View and manage your meeting room reservations
          </Typography>
          <BookingList />
        </CardContent>
      </Card>
    </TabPanel>
  );

  const adminMarkup =
    user.role === "admin" ? (
      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontSize={18} gutterBottom>
              Administration Panel
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage rooms and bookings
            </Typography>
            <AdminPanel />
          </CardContent>
        </Card>
      </TabPanel>
    ) : null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar
          sx={{
            px: 2,
            py: 1,
          }}
        >
          <Stack sx={{ flexGrow: 1 }} spacing={1}>
            <Typography
              variant="h6"
              fontSize={16}
              color="primary"
              fontWeight={600}
            >
              TOLUAI Meeting Room
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Welcome back, {user.firstName} {user.lastName}
            </Typography>
          </Stack>

          <Stack
            direction={"row"}
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
          >
            <Chip
              label={user.role === "admin" ? "Administrator" : "User"}
              color={user.role === "admin" ? "primary" : "default"}
              variant={user.role === "admin" ? "filled" : "outlined"}
              size="small"
            />

            <Button
              variant="outlined"
              startIcon={<LogOut size={16} />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Stack sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              icon={<Users size={16} />}
              label="Rooms"
              iconPosition="start"
            />
            <Tab
              icon={<Calendar size={16} />}
              label="My Bookings"
              iconPosition="start"
            />
            {user.role === "admin" && (
              <Tab
                icon={<Settings size={16} />}
                label="Admin"
                iconPosition="start"
              />
            )}
          </Tabs>
        </Stack>

        {roomsMarkup}
        {bookingsMarkup}
        {adminMarkup}
      </Container>
    </Box>
  );
}
