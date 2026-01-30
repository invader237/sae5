import React, { createContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchMe, UserDTO } from "@/api/auth.api";

interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isWatcher: boolean;
  isPrivileged: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === "admin";
  const isWatcher = user?.role === "watcher";
  const isPrivileged = isAdmin || isWatcher;

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("authToken");
    setUser(null);
    setToken(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const userData = await fetchMe(token);
      setUser(userData);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        await logout();
      } else {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
      }
    }
  }, [token, logout]);

  const login = useCallback(
    async (accessToken: string) => {
      await AsyncStorage.setItem("authToken", accessToken);
      setToken(accessToken);

      try {
        const userData = await fetchMe(accessToken);
        setUser(userData);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        await logout();
        throw error;
      }
    },
    [logout]
  );

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) {
          setToken(storedToken);
          await login(storedToken);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isWatcher,
        isPrivileged,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
