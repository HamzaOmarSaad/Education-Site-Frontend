import { useCallback, useMemo, useState, type ReactNode } from "react";
import { userContext, type UserDataType } from "./contextCreation";
import { isAxiosError } from "axios";
import { api } from "../../api/client";

function UserContextProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserDataType | null>(null);

  const getUserData = useCallback(async (token: string) => {
    try {
      const { data } = await api(`/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profile = data?.data ?? data;
      setUserData(profile ?? null);
    } catch (error) {
      if (isAxiosError(error)) {
        console.log("🚀 ~ getUserData ~ error:", error.cause);
      }
      setUserData(null);
    }
  }, []);

  const value = useMemo(
    () => ({ userData, getUserData }),
    [getUserData, userData],
  );

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
}

export default UserContextProvider;
