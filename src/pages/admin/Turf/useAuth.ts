import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User, IdTokenResult } from "firebase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  claims: { [key: string]: any } | null;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [claims, setClaims] = useState<{ [key: string]: any } | null>(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        try {
          // Force refresh token to get latest claims
          const tokenResult: IdTokenResult = await u.getIdTokenResult(true);
          
          console.log("Refreshed ID token claims:", tokenResult.claims);

          setClaims(tokenResult.claims);
          setIsAdmin(!!tokenResult.claims.admin); // true if admin: true exists
        } catch (err) {
          console.error("Failed to refresh token / get claims:", err);
          setClaims(null);
          setIsAdmin(false);
        }
      } else {
        setClaims(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAdmin, claims };
}