import { GetUserAuthorizationDetails, HandleAxiosError } from "@/lib/auth";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

const getBookings = async ({ all }: { all?: boolean }) => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.get(`${BACKEND_URL}/api/bookings/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: { all: all ? "true" : "false" },
    });

    return response.data;
  } catch (error) {
    HandleAxiosError(error);
    throw error; // Handle errors as needed
  }
};

const getBookingById = async (bookingId: string) => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.get(
      `${BACKEND_URL}/api/bookings/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    HandleAxiosError(error);
    throw error; // Handle errors as needed
  }
};

const createBooking = async ({
  title,
  description,
  startTime,
  endTime,
  room,
}: {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  room: string;
}) => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.post(
      `${BACKEND_URL}/api/bookings/`,
      {
        title,
        description,
        startTime,
        endTime,
        room,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    HandleAxiosError(error);
    throw error; // Handle errors as needed
  }
};

const updateBooking = async ({
  bookingId,
  title,
  description,
  startTime,
  endTime,
  attendees,
}: {
  bookingId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees: string[];
}) => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.put(
      `${BACKEND_URL}/api/bookings/${bookingId}`,
      {
        title,
        description,
        startTime,
        endTime,
        attendees,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    HandleAxiosError(error);
    throw error; // Handle errors as needed
  }
};

const cancelBooking = async (bookingId: string) => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.delete(
      `${BACKEND_URL}/api/bookings/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    HandleAxiosError(error);
    throw error; // Handle errors as needed
  }
};

export {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  updateBooking,
};
