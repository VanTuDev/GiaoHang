import { useCallback, useMemo, useState } from "react";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "authUser";

export function useAuthState() {
   const [accessToken, setAccessToken] = useState(
      () => localStorage.getItem(ACCESS_TOKEN_KEY) || ""
   );
   const [refreshToken, setRefreshToken] = useState(
      () => localStorage.getItem(REFRESH_TOKEN_KEY) || ""
   );
   const [user, setUser] = useState(() => {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
   });

   const saveSession = useCallback((payload) => {
      if (!payload) return;
      const { accessToken: at, refreshToken: rt, user: u } = payload;
      if (at) {
         localStorage.setItem(ACCESS_TOKEN_KEY, at);
         setAccessToken(at);
      }
      if (rt) {
         localStorage.setItem(REFRESH_TOKEN_KEY, rt);
         setRefreshToken(rt);
      }
      if (u) {
         localStorage.setItem(USER_KEY, JSON.stringify(u));
         setUser(u);
      }
   }, []);

   const clearSession = useCallback(() => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setAccessToken("");
      setRefreshToken("");
      setUser(null);
   }, []);

   return useMemo(
      () => ({ accessToken, refreshToken, user, saveSession, clearSession }),
      [accessToken, refreshToken, user, saveSession, clearSession]
   );
}


