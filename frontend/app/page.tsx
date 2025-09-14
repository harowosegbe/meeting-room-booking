"use client";

import { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { LoginForm } from "@/components/auth/login-form";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getUser } from "@/api/users";
import { AuthProvider, User } from "@/providers/auth";
import { clearSession } from "@/lib/auth";
import { ToastContainer } from "react-toastify";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<User>(null);

  const logoutFunction = () => {
    clearSession();
  };

  const handleAuth = async () => {
    try {
      setIsLoading(true);
      const state = await getUser();

      if (!state.user) {
        throw new Error("No user data found");
      }

      if (state.user) {
        setUser(state.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleAuth();
  }, []);

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
    );
  }

  return (
    <AuthProvider
      user={user}
      setUser={setUser}
      isAuthenticated={isAuthenticated}
      setIsAuthenticated={setIsAuthenticated}
      logoutFunction={logoutFunction}
    >
      <Box
        component="main"
        sx={{ minHeight: "100vh", bgcolor: "background.default" }}
      >
        {isAuthenticated ? <Dashboard /> : <LoginForm onLogin={handleAuth} />}
        <ToastContainer />
      </Box>
    </AuthProvider>
  );
}
