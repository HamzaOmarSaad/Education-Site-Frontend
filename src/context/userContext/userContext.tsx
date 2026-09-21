import { useState, type ReactNode } from "react";
import { userContext, type UserDataType } from "./contextCreation";
import axios, { isAxiosError } from "axios";

function UserContextProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserDataType | null>(null);

  async function getUserData(token: string) {
    try {
      const { data } = await axios(`http://localhost:3000/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(data.data);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log("🚀 ~ getUserData ~ error:", error.cause);
      }
    }
  }

  const value = { userData, getUserData };

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
}

export default UserContextProvider;
