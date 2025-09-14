"use client";

import type React from "react";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Tabs,
  Tab,
  Grid,
  Container,
  IconButton,
  Stack,
} from "@mui/material";
import { loginUser, registerUser } from "@/api/users";
import { setSession } from "@/lib/auth";
import { Eye, EyeClosed, EyeOff } from "lucide-react";

interface LoginFormProps {
  onLogin: () => void;
}

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
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </Stack>
  );
}

const PasswordInput = ({
  password,
  onChange,
  helperText,
}: {
  password: string;
  onChange: (value: string) => void;
  helperText?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <TextField
      fullWidth
      label="Password"
      type={showPassword ? "text" : "password"}
      size="small"
      value={password}
      onChange={(e) => onChange(e.target.value)}
      required
      slotProps={{
        htmlInput: { minLength: 6 },
        input: {
          endAdornment: (
            <IconButton onClick={toggleShowPassword}>
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </IconButton>
          ),
        },
      }}
      helperText={helperText}
    />
  );
};

export function LoginForm({ onLogin }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser(loginData);

      if (response.token) {
        setSession(response.token);
        onLogin();
      } else {
        setError("Login failed, please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await registerUser(registerData);

      if (response.token) {
        setSession(response.token);
        onLogin();
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError("");
  };

  const registerMarkup = (
    <TabPanel value={tabValue} index={1}>
      <Box
        component="form"
        onSubmit={handleRegister}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          fullWidth
          label="First Name"
          size="small"
          value={registerData.firstName}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              firstName: e.target.value,
            })
          }
          required
        />

        <TextField
          fullWidth
          label="Last Name"
          size="small"
          value={registerData.lastName}
          onChange={(e) =>
            setRegisterData({
              ...registerData,
              lastName: e.target.value,
            })
          }
          required
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          size="small"
          value={registerData.email}
          onChange={(e) =>
            setRegisterData({ ...registerData, email: e.target.value })
          }
          required
        />

        <PasswordInput
          password={registerData.password}
          onChange={(value) =>
            setRegisterData({ ...registerData, password: value })
          }
          helperText="Minimum 6 characters"
        />

        {error && <Alert severity="error">{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={isLoading}
          sx={{ mt: 1 }}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </Box>
    </TabPanel>
  );

  const loginMarkup = (
    <TabPanel value={tabValue} index={0}>
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          fullWidth
          label="Email"
          type="email"
          size="small"
          value={loginData.email}
          onChange={(e) =>
            setLoginData({ ...loginData, email: e.target.value })
          }
          required
        />

        <PasswordInput
          password={loginData.password}
          onChange={(value) => setLoginData({ ...loginData, password: value })}
        />

        {error && <Alert severity="error">{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={isLoading}
          sx={{ mt: 1 }}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </Box>
    </TabPanel>
  );

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          input: {
            py: 1.5,
          },
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="h5" color="primary" fontWeight={500}>
                TOLUAI Meeting Room
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account or create a new one
              </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab label="Login" />
                <Tab label="Register" />
              </Tabs>
            </Box>

            {loginMarkup}
            {registerMarkup}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
