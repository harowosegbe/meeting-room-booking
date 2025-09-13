"use client"

import { useState, useEffect } from "react"
import { Box, CircularProgress } from "@mui/material"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("token")
    if (token) {
      // Verify token with backend
      fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
          }
        })
        .catch(() => {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {isAuthenticated ? (
        <Dashboard onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <LoginForm onLogin={() => setIsAuthenticated(true)} />
      )}
    </Box>
  )
}
