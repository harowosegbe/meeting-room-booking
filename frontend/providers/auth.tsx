import React, { createContext, useContext, useState, ReactNode } from "react";

enum UserRole {
  User = "user",
  Admin = "admin",
  SuperAdmin = "superadmin",
}

type User = {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
} | null;

type AuthContextType = {
  user: User;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  user,
  setUser,
  isAuthenticated,
  setIsAuthenticated,
  logoutFunction,
}: {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  children: ReactNode;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  logoutFunction: () => void;
}) => {
  const logout = () => {
    setUser(null);
    logoutFunction();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { User };
