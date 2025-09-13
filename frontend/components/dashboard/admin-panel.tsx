"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Users, Calendar, Building } from "lucide-react"

interface Room {
  _id: string
  name: string
  capacity: number
  location: string
  description?: string
  amenities: string[]
  isActive: boolean
  createdAt: string
}

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: "user" | "admin"
  isActive: boolean
  createdAt: string
}

interface Booking {
  _id: string
  title: string
  startTime: string
  endTime: string
  status: "confirmed" | "cancelled"
  room: {
    name: string
    location: string
  }
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("rooms")
  const [rooms, setRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (activeTab === "rooms") {
      fetchRooms()
    } else if (activeTab === "users") {
      fetchUsers()
    } else if (activeTab === "bookings") {
      fetchAllBookings()
    }
  }, [activeTab])

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/rooms?active=false", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setRooms(data.rooms)
      }
    } catch (error) {
      setError("Failed to fetch rooms")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    // Note: This would need a users endpoint in the backend
    setUsers([])
    setIsLoading(false)
  }

  const fetchAllBookings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
      }
    } catch (error) {
      setError("Failed to fetch bookings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            All Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Room Management</h3>
            <AddRoomDialog onRoomAdded={fetchRooms} />
          </div>
          <RoomManagement rooms={rooms} onRoomUpdated={fetchRooms} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">User Management</h3>
          </div>
          <UserManagement users={users} />
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">All Bookings</h3>
          </div>
          <BookingManagement bookings={bookings} onBookingUpdated={fetchAllBookings} />
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function AddRoomDialog({ onRoomAdded }: { onRoomAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    location: "",
    description: "",
    amenities: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          capacity: Number.parseInt(formData.capacity),
          amenities: formData.amenities
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a),
        }),
      })

      if (response.ok) {
        setIsOpen(false)
        setFormData({ name: "", capacity: "", location: "", description: "", amenities: "" })
        onRoomAdded()
      } else {
        const data = await response.json()
        setError(data.message || "Failed to create room")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>Create a new meeting room for booking</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities (comma-separated)</Label>
            <Input
              id="amenities"
              placeholder="WiFi, Projector, Whiteboard"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RoomManagement({ rooms, onRoomUpdated }: { rooms: Room[]; onRoomUpdated: () => void }) {
  const toggleRoomStatus = async (roomId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        onRoomUpdated()
      }
    } catch (error) {
      console.error("Error updating room:", error)
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amenities</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room._id}>
              <TableCell className="font-medium">{room.name}</TableCell>
              <TableCell>{room.location}</TableCell>
              <TableCell>{room.capacity}</TableCell>
              <TableCell>
                <Badge variant={room.isActive ? "default" : "secondary"}>{room.isActive ? "Active" : "Inactive"}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 2).map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {room.amenities.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{room.amenities.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleRoomStatus(room._id, room.isActive)}>
                    {room.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function UserManagement({ users }: { users: User[] }) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                User management endpoint not implemented yet
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function BookingManagement({ bookings, onBookingUpdated }: { bookings: Booking[]; onBookingUpdated: () => void }) {
  const cancelBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        onBookingUpdated()
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Meeting</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const startDateTime = formatDateTime(booking.startTime)
            const endDateTime = formatDateTime(booking.endTime)

            return (
              <TableRow key={booking._id}>
                <TableCell className="font-medium">{booking.title}</TableCell>
                <TableCell>
                  {booking.room.name}
                  <div className="text-xs text-muted-foreground">{booking.room.location}</div>
                </TableCell>
                <TableCell>
                  {booking.user.firstName} {booking.user.lastName}
                  <div className="text-xs text-muted-foreground">{booking.user.email}</div>
                </TableCell>
                <TableCell>
                  {startDateTime.date}
                  <div className="text-xs text-muted-foreground">
                    {startDateTime.time} - {endDateTime.time}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>{booking.status}</Badge>
                </TableCell>
                <TableCell>
                  {booking.status === "confirmed" && (
                    <Button variant="outline" size="sm" onClick={() => cancelBooking(booking._id)}>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
