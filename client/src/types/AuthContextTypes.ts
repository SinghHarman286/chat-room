export type AuthContextType = {
  token: string | null;
  user: UserProfileType | null;
  isLoggedIn: boolean;
  login: (user: { token: string | null; userId: string; username: string }, expTime: string) => void;
  logout: () => void;
};

export type UserProfileType = {
  userId: string;
  username: string;
};

export type AuthPayload = {
  email: string;
  username?: string;
  password: string;
};
