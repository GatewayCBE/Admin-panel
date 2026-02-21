import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User, IdTokenResult } from "firebase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  role: string | null;          // ✅ NEW
  claims: { [key: string]: any } | null;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string | null>(null);   // ✅ NEW
  const [claims, setClaims] = useState<{ [key: string]: any } | null>(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        try {
          // 🔄 Force refresh → ensures latest claims
          const tokenResult: IdTokenResult =
            await u.getIdTokenResult(true);

          console.log("Refreshed ID token claims:", tokenResult.claims);

          const userClaims = tokenResult.claims;

          setClaims(userClaims);
          setIsAdmin(!!userClaims.admin);

          // ✅ Extract role
          setRole((userClaims.role as string) || null);

        } catch (err) {
          console.error("Failed to refresh token / get claims:", err);
          setClaims(null);
          setIsAdmin(false);
          setRole(null);
        }
      } else {
        setClaims(null);
        setIsAdmin(false);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAdmin, role, claims };
}
