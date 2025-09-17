import { useEffect, useState } from "react";

const USER_KEY = "authUser";

export default function useLocalUser() {
   const [user, setUser] = useState(() => {
      try {
         const raw = localStorage.getItem(USER_KEY);
         return raw ? JSON.parse(raw) : null;
      } catch {
         return null;
      }
   });

   useEffect(() => {
      const handler = () => {
         try {
            const raw = localStorage.getItem(USER_KEY);
            setUser(raw ? JSON.parse(raw) : null);
         } catch {
            setUser(null);
         }
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
   }, []);

   return user;
}


