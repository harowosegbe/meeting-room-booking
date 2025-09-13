"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
} from "@mui/material"
import { LogOut, Calendar, Users, Settings } from "lucide-react"
import { RoomGrid } from "./room-grid"
import { BookingList } from "./booking-list"
import { AdminPanel } from "./admin-panel"

interface DashboardProps {
  onLogout: () => void
}

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: "user" | "admin"
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    onLogout()
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" color="primary" fontWeight="bold">
              Meeting Room Booking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back, {user.firstName} {user.lastName}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Chip
              label={user.role === "admin" ? "Administrator" : "User"}
              color={user.role === "admin" ? "primary" : "default"}
              variant={user.role === "admin" ? "filled" : "outlined"}
            />
            <Button variant="outlined" startIcon={<LogOut size={16} />} onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<Users size={16} />} label="Rooms" iconPosition="start" />
            <Tab icon={<Calendar size={16} />} label="My Bookings" iconPosition="start" />
            {user.role === "admin" && <Tab icon={<Settings size={16} />} label="Admin" iconPosition="start" />}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Meeting Rooms
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Browse and book available meeting rooms for your team
              </Typography>
              <RoomGrid />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Bookings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage your meeting room reservations
              </Typography>
              <BookingList />
            </CardContent>
          </Card>
        </TabPanel>

        {user.role === "admin" && (
          <TabPanel value={activeTab} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Administration Panel
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Manage rooms, users, and system settings
                </Typography>
                <AdminPanel />
              </CardContent>
            </Card>
          </TabPanel>
        )}
      </Container>
    </Box>
  )
}
