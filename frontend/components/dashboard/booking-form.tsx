"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DialogClose } from "@/components/ui/dialog"

interface Room {
  _id: string
  name: string
  capacity: number
  location: string
}

interface BookingFormProps {
  room: Room
}

export function BookingForm({ room }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    attendees: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Combine date and time for API
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`)

      const attendeesList = formData.attendees
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0)

      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room: room._id,
          title: formData.title,
          description: formData.description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          attendees: attendeesList,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setFormData({
          title: "",
          description: "",
          date: "",
          startTime: "",
          endTime: "",
          attendees: "",
        })
      } else {
        setError(data.message || "Booking failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-green-600 text-lg font-semibold mb-2">Booking Successful!</div>
        <p className="text-muted-foreground mb-4">Your meeting room has been booked successfully.</p>
        <DialogClose asChild>
          <Button>Close</Button>
        </DialogClose>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Meeting Title</Label>
        <Input
          id="title"
          placeholder="Enter meeting title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          min={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Meeting agenda or notes"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendees">Attendees (Optional)</Label>
        <Input
          id="attendees"
          placeholder="Enter email addresses separated by commas"
          value={formData.attendees}
          onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline" className="flex-1 bg-transparent">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Booking..." : "Book Room"}
        </Button>
      </div>
    </form>
  )
}
