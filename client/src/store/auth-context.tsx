import React, { useState, useEffect, useCallback } from "react";

let logOutTimer: NodeJS.Timeout;

interface AuthContextInterface {
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, expTime: string) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextInterface>({
  token: null,
  isLoggedIn: false,
  login: (token: string, expTime: string) => {},
  logout: () => {},
});

const calcRemainingTime = (expTime: string) => {
  const currTime = new Date().getTime();
  const adjExpTime = new Date(expTime).getTime();

  const remainingTime = adjExpTime - currTime;

  return remainingTime;
};

const retrieveStoreToken = () => {
  const storedToken = localStorage.getItem("tokenId");
  const storedExpirationTime = localStorage.getItem("expTime");

  const remainingTime = calcRemainingTime(storedExpirationTime!);

  if (remainingTime <= 60000) {
    localStorage.removeItem("tokenId");
    localStorage.removeItem("expTime");
    localStorage.removeItem("username");
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

const AuthContextProvider: React.FC = ({ children }) => {
  const tokenData = retrieveStoreToken();
  let initialToken = null;
  if (tokenData) {
    initialToken = tokenData.token;
  }

  const [token, setToken] = useState(initialToken);

  const isUserLoggedIn = !!token;

  const handleLogin = (token: string | null, expTime: string) => {
    setToken(token);
    localStorage.setItem("tokenId", token as string);
    localStorage.setItem("expTime", expTime);

    const remainingTime = calcRemainingTime(expTime);

    logOutTimer = setTimeout(handleLogout, remainingTime);
  };

  const handleLogout = useCallback(() => {
    setToken("");
    localStorage.removeItem("tokenId");
    localStorage.removeItem("expTime");
    localStorage.removeItem("username");

    if (logOutTimer) {
      clearTimeout(logOutTimer);
    }
  }, []);

  const contextValue = {
    token: token,
    isLoggedIn: isUserLoggedIn,
    login: handleLogin,
    logout: handleLogout,
  };

  useEffect(() => {
    if (tokenData) {
      logOutTimer = setTimeout(handleLogout, tokenData.duration);
    }
  }, [tokenData, handleLogout]);
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export { AuthContextProvider };
export default AuthContext;
