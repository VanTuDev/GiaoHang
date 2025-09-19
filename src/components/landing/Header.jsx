import { useState } from "react";

export default function Header() {
   const [open, setOpen] = useState(false);

   return (
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur">
         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <a href="/" className="text-lg font-semibold text-green-700">
               GiaoHangDaNang
            </a>
            <nav className="hidden items-center gap-6 text-sm text-gray-700 md:flex">
               <a href="#services" className="hover:text-green-700">Dịch vụ</a>
               <a href="#features" className="hover:text-green-700">Tính năng</a>
               <a href="#contact" className="hover:text-green-700">Liên hệ</a>
            </nav>
            <div className="hidden items-center gap-2 md:flex">
               <a href="/auth/login" className="rounded-md px-4 py-2 text-green-700 hover:bg-green-50">Đăng nhập</a>
               <a href="/auth/register" className="rounded-md bg-green-700 px-4 py-2 text-white hover:bg-green-800">Đăng ký</a>
            </div>
            <button
               className="inline-flex items-center rounded-md p-2 md:hidden"
               aria-label="Toggle menu"
               onClick={() => setOpen((v) => !v)}
            >
               <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
               </svg>
            </button>
         </div>
         {open && (
            <div className="border-t border-gray-100 bg-white md:hidden">
               <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3">
                  <a href="#services" className="py-2 text-gray-700">Dịch vụ</a>
                  <a href="#features" className="py-2 text-gray-700">Tính năng</a>
                  <a href="#contact" className="py-2 text-gray-700">Liên hệ</a>
                  <div className="mt-2 flex items-center gap-2">
                     <a href="/auth/login" className="flex-1 rounded-md px-4 py-2 text-center text-green-700 hover:bg-green-50">Đăng nhập</a>
                     <a href="/auth/register" className="flex-1 rounded-md bg-green-700 px-4 py-2 text-center text-white hover:bg-green-800">Đăng ký</a>
                  </div>
               </div>
            </div>
         )}
      </header>
   );
}


