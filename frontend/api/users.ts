import axios from "axios";
import { GetUserAuthorizationDetails, HandleAxiosError } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

const registerUser = async ({
  email,
  password,
  firstName,
  lastName,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/users/register`, {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
    });

    return response.data;
  } catch (error) {
    HandleAxiosError(error);
    throw error; // Handle errors as needed
  }
};

const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/users/login`, {
      email: email,
      password: password,
    });

    return response.data;
  } catch (error) {
    HandleAxiosError(error);
    throw error; // Handle errors as needed
  }
};

const getUser = async () => {
  try {
    const { accessToken } = GetUserAuthorizationDetails();

    const response = await axios.get(`${BACKEND_URL}/api/users/me/`, {
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

export { registerUser, loginUser, getUser };
