import { useCallback, useMemo, useState } from "react";

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

export function useAuthState() {
   const [accessToken, setAccessToken] = useState(
      () => localStorage.getItem(ACCESS_TOKEN_KEY) || ""
   );
   const [user, setUser] = useState(() => {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
   });

   const saveSession = useCallback((payload) => {
      if (!payload) return;
      const { accessToken: at, user: u } = payload;
      if (at) {
         localStorage.setItem(ACCESS_TOKEN_KEY, at);
         setAccessToken(at);
      }
      if (u) {
         localStorage.setItem(USER_KEY, JSON.stringify(u));
         setUser(u);
      }
   }, []);

   const clearSession = useCallback(() => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setAccessToken("");
      setUser(null);
   }, []);

   return useMemo(
      () => ({ accessToken, user, saveSession, clearSession }),
      [accessToken, user, saveSession, clearSession]
   );
}


