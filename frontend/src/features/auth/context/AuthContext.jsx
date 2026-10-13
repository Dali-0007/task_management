
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import apiClient from "../../../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const response = await apiClient.get("/auth/me");
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiClient.post("/auth/sign-out");
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get("/auth/me")
      .then((response) => {
        if (isMounted) {
          setUser(response.data.user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, refreshUser, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// The hook lives beside its provider; fast refresh falls back to a full reload here.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
