# 🔧 Hướng dẫn cấu hình biến môi trường

## 📋 Tạo file `.env`

Tạo file `.env` trong thư mục `FE_GiaoHangDaNang` với nội dung:

```env
# API Base URL - URL của backend API
# Development: http://localhost:8080
# Production: https://your-backend.onrender.com
VITE_API_BASE_URL=http://localhost:8080

# Socket.IO URL - URL của Socket.IO server
# Development: http://localhost:8080
# Production: https://your-backend.onrender.com
VITE_SOCKET_URL=http://localhost:8080
```

## 🚀 Cấu hình cho Vercel

Khi deploy lên Vercel, thêm các biến môi trường trong Vercel Dashboard:

1. Vào **Settings** → **Environment Variables**
2. Thêm các biến sau:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080` (dev) hoặc `https://your-backend.onrender.com` (prod) | Production, Preview, Development |
| `VITE_SOCKET_URL` | `http://localhost:8080` (dev) hoặc `https://your-backend.onrender.com` (prod) | Production, Preview, Development |

## 📝 Lưu ý

- Tất cả biến môi trường trong Vite phải bắt đầu bằng `VITE_`
- Sau khi thêm biến môi trường trên Vercel, cần **redeploy** để áp dụng

### 🔧 Development Mode (npm run dev)

- **API Calls**: Luôn sử dụng proxy (`"/"`) trong DEV mode, **bỏ qua** `VITE_API_BASE_URL` từ `.env`
  - Lý do: Khi truy cập từ mobile qua IP (`192.168.1.124:3000`), `localhost:8080` không hoạt động
  - Proxy tự động chuyển request `/api/*` → `http://localhost:8080/api/*` trên server
  - Hoạt động với cả `localhost:3000` và `192.168.1.124:3000`

- **Socket.IO**: Tự động detect và thay `localhost` bằng IP hiện tại nếu truy cập từ IP
  - Ví dụ: Nếu truy cập từ `192.168.1.124:3000`, Socket.IO sẽ tự động dùng `192.168.1.124:8080`
  - Giúp mobile device có thể kết nối Socket.IO được

### 🚀 Production Mode (npm run build)

- **API Calls**: Sử dụng `VITE_API_BASE_URL` trực tiếp
- **Socket.IO**: Sử dụng `VITE_SOCKET_URL` trực tiếp

## ✅ Kiểm tra

Sau khi deploy, kiểm tra:
1. Mở DevTools → Console
2. Kiểm tra `import.meta.env.VITE_API_BASE_URL` có giá trị đúng không
3. Kiểm tra API calls có gọi đúng URL không

