"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookingForm } from "./booking-form"
import { Users, MapPin, Wifi, Monitor, Coffee } from "lucide-react"

interface Room {
  _id: string
  name: string
  capacity: number
  location: string
  description?: string
  amenities: string[]
  isActive: boolean
}

export function RoomGrid() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRooms(data.rooms)
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "projector":
      case "screen":
        return <Monitor className="h-4 w-4" />
      case "coffee":
        return <Coffee className="h-4 w-4" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <Card key={room._id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {room.name}
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {room.capacity}
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {room.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {room.description && <p className="text-sm text-muted-foreground">{room.description}</p>}

            {room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {room.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {getAmenityIcon(amenity)}
                    {amenity}
                  </Badge>
                ))}
              </div>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" onClick={() => setSelectedRoom(room)}>
                  Book Room
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Book {room.name}</DialogTitle>
                  <DialogDescription>Schedule a meeting in this room</DialogDescription>
                </DialogHeader>
                {selectedRoom && <BookingForm room={selectedRoom} />}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
