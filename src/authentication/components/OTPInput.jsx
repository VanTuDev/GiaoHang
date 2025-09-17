import { useEffect, useRef } from "react";

export default function OTPInput({ length = 6, value = "", onChange }) {
   const inputsRef = useRef([]);

   useEffect(() => {
      inputsRef.current = inputsRef.current.slice(0, length);
   }, [length]);

   const handleChange = (idx, char) => {
      const chars = value.split("");
      chars[idx] = char.replace(/\D/g, "").slice(0, 1);
      const next = chars.join("");
      onChange?.(next);
      if (char && idx < length - 1) {
         inputsRef.current[idx + 1]?.focus();
      }
   };

   const handleKeyDown = (idx, e) => {
      if (e.key === "Backspace" && !value[idx] && idx > 0) {
         inputsRef.current[idx - 1]?.focus();
      }
   };

   return (
      <div className="flex gap-2">
         {Array.from({ length }).map((_, i) => (
            <input
               key={i}
               ref={(el) => (inputsRef.current[i] = el)}
               inputMode="numeric"
               maxLength={1}
               className="w-10 h-12 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
               value={value[i] || ""}
               onChange={(e) => handleChange(i, e.target.value)}
               onKeyDown={(e) => handleKeyDown(i, e)}
            />
         ))}
      </div>
   );
}


