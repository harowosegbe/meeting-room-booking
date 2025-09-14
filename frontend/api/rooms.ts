import { GetUserAuthorizationDetails, HandleAxiosError } from "@/lib/auth";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

const getRooms = async ({ active = "false" }: { active?: string }) => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.get(`${BACKEND_URL}/api/rooms/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: { active: active },
    });

    return response.data;
  } catch (error) {
    HandleAxiosError(error);
    throw error; // Handle errors as needed
  }
};

const getRoomById = async (roomId: string) => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.get(`${BACKEND_URL}/api/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    HandleAxiosError(error);
    throw error; // Handle errors as needed
  }
};

const createRoom = async ({
  name,
  location,
  capacity,
  amenities,
}: {
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
}) => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.post(
      `${BACKEND_URL}/api/rooms/`,
      {
        name: name,
        location: location,
        capacity: capacity,
        amenities: amenities,
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

const updateRoom = async ({
  roomId,
  name,
  location,
  capacity,
  amenities,
  isActive,
  description,
}: {
  roomId: string;
  name?: string;
  location?: string;
  capacity?: number;
  amenities?: string[];
  isActive?: boolean;
  description?: string;
}) => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.put(
      `${BACKEND_URL}/api/rooms/${roomId}`,
      {
        name,
        location,
        capacity,
        amenities,
        isActive,
        description,
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

const deleteRoom = async (roomId: string) => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.delete(`${BACKEND_URL}/api/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    HandleAxiosError(error);
    throw error; // Handle errors as needed
  }
};

export { getRooms, getRoomById, createRoom, updateRoom, deleteRoom };
