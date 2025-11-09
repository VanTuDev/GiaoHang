# 🚀 Hướng dẫn Deploy lên Vercel

## 📋 Yêu cầu

- Tài khoản Vercel
- Backend đã được deploy (Render, Railway, hoặc server khác)
- GitHub/GitLab repository

## 🔧 Các bước deploy

### 1. Chuẩn bị Backend

Đảm bảo backend đã được deploy và có URL công khai, ví dụ:
- `https://your-backend.onrender.com`
- `https://your-backend.railway.app`

### 2. Cấu hình Environment Variables trên Vercel

1. Đăng nhập [Vercel Dashboard](https://vercel.com/dashboard)
2. Import project từ GitHub/GitLab
3. Vào **Settings** → **Environment Variables**
4. Thêm các biến sau:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` | Production, Preview, Development |
| `VITE_SOCKET_URL` | `https://your-backend.onrender.com` | Production, Preview, Development |

**Lưu ý:** Thay `https://your-backend.onrender.com` bằng URL thực tế của backend bạn.

### 3. Cấu hình Build Settings

Vercel sẽ tự động detect Vite, nhưng đảm bảo:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. Deploy

1. Click **Deploy**
2. Đợi build hoàn tất
3. Kiểm tra URL được tạo (ví dụ: `https://your-app.vercel.app`)

### 5. Cập nhật CORS trên Backend

Đảm bảo backend cho phép CORS từ domain Vercel:

```javascript
// Backend config/cors.js
const corsOptions = {
   origin: [
      'https://your-app.vercel.app',
      'https://your-app-git-main.vercel.app' // Preview URLs
   ],
   credentials: true
};
```

## ✅ Kiểm tra sau khi deploy

1. Mở DevTools → Console
2. Kiểm tra `import.meta.env.VITE_API_BASE_URL` có giá trị đúng
3. Thử đăng nhập/đăng ký
4. Kiểm tra Socket.IO connection

## 🐛 Troubleshooting

### Lỗi: API calls fail
- Kiểm tra `VITE_API_BASE_URL` đã được set trong Vercel
- Kiểm tra CORS trên backend
- Kiểm tra backend đang chạy

### Lỗi: Socket.IO không kết nối
- Kiểm tra `VITE_SOCKET_URL` đã được set
- Kiểm tra backend Socket.IO server đang chạy
- Kiểm tra firewall/network

### Lỗi: Build failed
- Kiểm tra `npm run build` chạy được local không
- Kiểm tra dependencies trong `package.json`
- Xem build logs trên Vercel

## 📝 File cấu hình

- `vercel.json` - Cấu hình Vercel
- `vite.config.js` - Cấu hình Vite
- `.env` - Biến môi trường local (không commit lên git)
- `ENV_SETUP.md` - Hướng dẫn chi tiết về biến môi trường

