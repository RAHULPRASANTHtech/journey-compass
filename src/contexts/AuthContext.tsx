import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const AUTH_STORAGE_KEY = "busongo-auth-email";

interface AuthContextType {
  userEmail: string | null;
  isLoggedIn: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmailState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AUTH_STORAGE_KEY);
  });

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(AUTH_STORAGE_KEY, userEmail);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [userEmail]);

  const login = (email: string) => {
    setUserEmailState(email.trim().toLowerCase());
  };

  const logout = () => {
    setUserEmailState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userEmail,
        isLoggedIn: !!userEmail,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
