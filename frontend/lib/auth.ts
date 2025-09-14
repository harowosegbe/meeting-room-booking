const STORAGE_KEY = "accessToken";

const setSession = (accessToken: string | null) => {
  if (accessToken) {
    sessionStorage.setItem(STORAGE_KEY, accessToken);
  }
};

const clearSession = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};

function SetUserAuthorizationDetails({ accessToken }: { accessToken: string }) {
  try {
    setSession(accessToken);
  } catch (error) {}
}

function GetUserAuthorizationDetails() {
  const accessToken = sessionStorage.getItem(STORAGE_KEY);

  return {
    accessToken: accessToken,
  };
}

function HandleAxiosError(error: any) {
  if (
    error &&
    error.response &&
    error.response.data &&
    error.response.data.message
  ) {
    throw new Error(error.response.data.message);
  }
  if (
    error &&
    error.response &&
    error.response.data &&
    error.response.data.error
  ) {
    throw new Error(error.response.data.error);
  }
}

export {
  GetUserAuthorizationDetails,
  HandleAxiosError,
  SetUserAuthorizationDetails,
  setSession,
  clearSession
};
