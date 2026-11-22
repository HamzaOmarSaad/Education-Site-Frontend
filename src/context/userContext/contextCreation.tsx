import { createContext } from "react";

export type UserDataType = {
  id: string;
  email: string;
  name: string;
  gender?: string;
  profilePicture?: string;
  grade?: {
    id: string;
    name: string;
  };
  studentProfile?: {
    school: string;
  };
  track?: {
    id: string;
    name: string;
  };
  school?: string;
};

type UserContextType = {
  userData: UserDataType | null;
  getUserData: (token: string) => Promise<void>;
};

export const userContext = createContext<UserContextType>({
  userData: null,
  getUserData: async () => {},
});
