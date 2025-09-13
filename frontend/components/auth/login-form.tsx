"use client"

import type React from "react"
import { useState } from "react"
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Tabs, Tab, Grid, Container } from "@mui/material"

interface LoginFormProps {
  onLogin: () => void
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
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [tabValue, setTabValue] = useState(0)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        onLogin()
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        onLogin()
      } else {
        setError(data.message || "Registration failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setError("")
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="h4" component="h1" color="primary" fontWeight="bold" gutterBottom>
                Meeting Room Booking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account or create a new one
              </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                <Tab label="Login" />
                <Tab label="Register" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="contained" fullWidth disabled={isLoading} sx={{ mt: 1 }}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleRegister} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      required
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                  inputProps={{ minLength: 6 }}
                  helperText="Minimum 6 characters"
                />
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="contained" fullWidth disabled={isLoading} sx={{ mt: 1 }}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </Box>
            </TabPanel>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
