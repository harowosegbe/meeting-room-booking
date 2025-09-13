"use client"

import type React from "react"

import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material"
import { cyan, grey, red } from "@mui/material/colors"

const theme = createTheme({
  palette: {
    primary: {
      main: cyan[600],
      light: cyan[400],
      dark: cyan[800],
    },
    secondary: {
      main: grey[600],
    },
    error: {
      main: red[600],
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
  },
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
