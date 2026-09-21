import { useState, type ReactNode } from "react";
import { verifyContext } from "./contextCreation";

function UserContextProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const value = { userEmail, setUserEmail };

  return (
    <verifyContext.Provider value={value}>{children}</verifyContext.Provider>
  );
}

export default UserContextProvider;
