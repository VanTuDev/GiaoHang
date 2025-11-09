# ✅ Checklist Deploy lên Vercel

## 🔧 Trước khi deploy

- [x] Đã cập nhật tất cả hardcoded URLs sang biến môi trường
- [x] Đã cấu hình `axiosClient` dùng `VITE_API_BASE_URL`
- [x] Đã cấu hình Socket.IO dùng `VITE_SOCKET_URL`
- [x] Đã sửa lỗi build (PWA workbox file size limit)
- [x] Đã tạo file `.env.example`
- [x] `npm run build` chạy thành công

## 📝 Các biến môi trường cần thiết

### Development (file `.env`)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
```

### Production (Vercel Environment Variables)
```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

## 🚀 Các bước deploy

1. **Push code lên GitHub/GitLab**
2. **Import project vào Vercel**
3. **Thêm Environment Variables trong Vercel Dashboard:**
   - Settings → Environment Variables
   - Thêm `VITE_API_BASE_URL` và `VITE_SOCKET_URL`
4. **Deploy**
5. **Kiểm tra:**
   - Mở DevTools → Console
   - Kiểm tra `import.meta.env.VITE_API_BASE_URL`
   - Test đăng nhập/đăng ký
   - Test Socket.IO connection

## ⚠️ Lưu ý

- Backend phải cho phép CORS từ domain Vercel
- Backend phải đang chạy và accessible
- Socket.IO server phải hỗ trợ CORS

## 📚 Tài liệu tham khảo

- `README_DEPLOY.md` - Hướng dẫn chi tiết
- `ENV_SETUP.md` - Hướng dẫn cấu hình biến môi trường

