import React, { useState, useEffect, useCallback } from "react";
import { AuthContextType, UserProfileType } from "../types/AuthContextTypes";

let logOutTimer: NodeJS.Timeout;

const AuthContext = React.createContext<AuthContextType>({
  token: null,
  user: null,
  isLoggedIn: false,
  login: (user: { token: string | null } & UserProfileType, expTime: string) => {},
  logout: () => {},
});

const calcRemainingTime = (expTime: string): number => {
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
    localStorage.removeItem("user");
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

const retrieveStoreUser = () => {
  const user: UserProfileType | null = JSON.parse(localStorage.getItem("user") || "null");
  return user;
};

const AuthContextProvider: React.FC = ({ children }) => {
  const tokenData = retrieveStoreToken();
  let initialToken: string | null = null;
  if (tokenData) {
    initialToken = tokenData.token;
  }

  const [token, setToken] = useState(initialToken);
  const userData = retrieveStoreUser();

  const [user, setUser] = useState<UserProfileType | null>(userData);

  const isUserLoggedIn = !!token;

  const handleLogin = (user: { token: string | null } & UserProfileType, expTime: string) => {
    setToken(user.token);
    const { userId, username } = user;
    setUser({ userId, username });

    localStorage.setItem("tokenId", user.token as string);
    localStorage.setItem("expTime", expTime);
    localStorage.setItem("user", JSON.stringify({ userId, username }));

    const remainingTime = calcRemainingTime(expTime);

    logOutTimer = setTimeout(handleLogout, remainingTime);
  };

  const handleLogout = useCallback(() => {
    setToken("");
    setUser(null);
    localStorage.removeItem("tokenId");
    localStorage.removeItem("expTime");
    localStorage.removeItem("user");

    if (logOutTimer) {
      clearTimeout(logOutTimer);
    }
  }, []);

  const contextValue = {
    token: token,
    user: user,
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
