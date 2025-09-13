"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, MapPin, Users, X } from "lucide-react"

interface Booking {
  _id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: "confirmed" | "cancelled"
  room: {
    _id: string
    name: string
    location: string
    capacity: number
  }
  attendees: string[]
}

export function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
      } else {
        setError("Failed to fetch bookings")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setBookings(
          bookings.map((booking) => (booking._id === bookingId ? { ...booking, status: "cancelled" } : booking)),
        )
      } else {
        setError("Failed to cancel booking")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date()
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
        <p className="text-muted-foreground">Start by booking a meeting room from the Rooms tab.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const startDateTime = formatDateTime(booking.startTime)
        const endDateTime = formatDateTime(booking.endTime)
        const upcoming = isUpcoming(booking.startTime)

        return (
          <Card key={booking._id} className={booking.status === "cancelled" ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {booking.title}
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>{booking.status}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {booking.room.name} - {booking.room.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {booking.room.capacity} capacity
                    </span>
                  </CardDescription>
                </div>
                {booking.status === "confirmed" && upcoming && (
                  <Button variant="outline" size="sm" onClick={() => cancelBooking(booking._id)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {startDateTime.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {startDateTime.time} - {endDateTime.time}
                </span>
              </div>

              {booking.description && <p className="text-sm text-muted-foreground">{booking.description}</p>}

              {booking.attendees.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Attendees: </span>
                  {booking.attendees.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
