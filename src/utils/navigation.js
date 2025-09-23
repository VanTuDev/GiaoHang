// Trả về đường dẫn mặc định sau khi đăng nhập dựa trên role
// Admin -> /admin, các role còn lại -> /dashboard
export function getPostLoginPath(role) {
   if (role === "Admin") return "/admin";
   if (role === "Driver") return "/driver";
   return "/dashboard";
}


