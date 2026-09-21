import { createContext } from "react";

type UserContextType = {
  userEmail: string | null;
  setUserEmail: React.Dispatch<React.SetStateAction<string | null>>;
};

export const verifyContext = createContext<UserContextType>({
  userEmail: null,
  setUserEmail: (() => {}) as React.Dispatch<
    React.SetStateAction<string | null>
  >,
});
