"use client";

import { createContext, useState, useEffect, useContext } from "react";
import axiosClient from "@/lib/axiosClient";

type User = {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  birthday?: string;
  role?: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string,
    birthday: Date
  ) => Promise<void>;
  syncUserFromToken: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      axiosClient
        .get("/user/info")
        .then((response) => {
          const apiUser = response.data.data;
          const mappedUser: User = {
            id: apiUser._id,
            username: apiUser.username,
            email: apiUser.email,
            avatar_url: apiUser.avatar_url,
            birthday: apiUser.birthday,
            role: apiUser.role,
          };
          setUser(mappedUser);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosClient.post("/auth/login", {
        email,
        password,
      });
      const { token } = response.data.data;
      localStorage.setItem("token", token);
      axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const userInfoResponse = await axiosClient.get("/user/info");
      const apiUser = userInfoResponse.data.data;
      const mappedUser: User = {
        id: apiUser._id,
        username: apiUser.username,
        email: apiUser.email,
        avatar_url: apiUser.avatar_url,
        birthday: apiUser.birthday,
        role: apiUser.role,
      };
      setUser(mappedUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(mappedUser));
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    birthday: Date
  ) => {
    try {
      const response = await axiosClient.post("/auth/register", {
        username,
        email,
        password,
        birthday: birthday.toISOString(),
      });

      const apiUser = response.data.user;
      const token = response.data.token;

      const mappedUser: User = {
        id: apiUser._id,
        username: apiUser.username,
        email: apiUser.email,
      };

      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  // Thêm hàm đồng bộ user từ token (dùng cho OAuth)
  const syncUserFromToken = async (token: string) => {
    localStorage.setItem("token", token);
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const userInfoResponse = await axiosClient.get("/user/info");
      const apiUser = userInfoResponse.data.data;
      const mappedUser: User = {
        id: apiUser._id,
        username: apiUser.username,
        email: apiUser.email,
        avatar_url: apiUser.avatar_url,
        birthday: apiUser.birthday,
        role: apiUser.role,
      };
      setUser(mappedUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(mappedUser));
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
        syncUserFromToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
