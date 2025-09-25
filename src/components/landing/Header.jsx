import { useState } from "react";
import { LoginOutlined, UserAddOutlined, MenuOutlined } from "@ant-design/icons";

export default function Header() {
   const [open, setOpen] = useState(false);

   return (
      <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/90 backdrop-blur">
         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <a href="/" className="flex items-center gap-2">
               <img src="/imgs/logonen.png" alt="Bengo" className="h-16 w-20" />
            </a>
            <nav className="hidden items-center gap-6 text-sm text-gray-700 md:flex">
               <a href="#services" className="hover:text-blue-900">Dịch vụ</a>
               <a href="#features" className="hover:text-blue-900">Tính năng</a>
               <a href="#stats" className="hover:text-blue-900">Thành tựu</a>
               <a href="#cta" className="hover:text-blue-900">Bắt đầu</a>
               <a href="#contact" className="hover:text-blue-900">Liên hệ</a>
            </nav>
            <div className="hidden items-center gap-2 md:flex">
               <a href="/auth/login" className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-blue-900 hover:bg-blue-50">
                  <LoginOutlined /> Đăng nhập
               </a>
               <a href="/auth/register" className="inline-flex items-center gap-2 rounded-md bg-blue-900 px-4 py-2 text-white hover:bg-blue-800">
                  <UserAddOutlined /> Đăng ký
               </a>
            </div>
            <button
               className="inline-flex items-center rounded-md p-2 md:hidden"
               aria-label="Toggle menu"
               onClick={() => setOpen((v) => !v)}
            >
               <MenuOutlined className="text-2xl text-blue-900" />
            </button>
         </div>
         {open && (
            <div className="border-t border-gray-100 bg-white md:hidden">
               <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3">
                  <a href="#services" className="py-2 text-gray-700">Dịch vụ</a>
                  <a href="#features" className="py-2 text-gray-700">Tính năng</a>
                  <a href="#stats" className="py-2 text-gray-700">Thành tựu</a>
                  <a href="#cta" className="py-2 text-gray-700">Bắt đầu</a>
                  <a href="#contact" className="py-2 text-gray-700">Liên hệ</a>
                  <div className="mt-2 flex items-center gap-2">
                     <a href="/auth/login" className="flex-1 rounded-md px-4 py-2 text-center text-blue-900 hover:bg-blue-50">Đăng nhập</a>
                     <a href="/auth/register" className="flex-1 rounded-md bg-blue-900 px-4 py-2 text-center text-white hover:bg-blue-800">Đăng ký</a>
                  </div>
               </div>
            </div>
         )}
      </header>
   );
}


