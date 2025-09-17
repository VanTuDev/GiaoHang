# PWA Demo: POS Bahung

Đây là dự án Progressive Web App (PWA) có khả năng hoạt động offline và cài đặt lên màn hình chính.

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 12.x trở lên
- npm hoặc yarn

### Cài đặt
```bash
# Clone dự án (nếu chưa có)
git clone <đường_dẫn_repository> 

# Cài đặt các dependencies
npm install
```

### Chạy ứng dụng
```bash
# Khởi động ứng dụng phát triển
npm run dev
```

Ứng dụng sẽ chạy tại http://localhost:3000

## Test trên điện thoại di động

Để test PWA trên điện thoại di động, bạn cần:

1. Đảm bảo máy tính và điện thoại kết nối cùng mạng WiFi
2. Tìm địa chỉ IP của máy tính:
   - Windows: Mở Command Prompt và gõ `ipconfig`
   - macOS/Linux: Mở Terminal và gõ `ifconfig` hoặc `ip addr`
3. Trên điện thoại, mở trình duyệt Chrome hoặc Safari và truy cập vào http://<địa_chỉ_IP>:3000

### Cài đặt PWA lên màn hình chính

- Trên Android (Chrome): Bấm vào biểu tượng menu (3 chấm) > Add to Home Screen
- Trên iOS (Safari): Bấm vào biểu tượng Share > Add to Home Screen

## Cấu trúc dự án

```
POS_BAHUNG_FE/
├── public/                  # Tài nguyên tĩnh
│   ├── icons/               # Các icon cho PWA
│   ├── logo.svg             # Logo chính
│   ├── service-worker.js    # Service Worker
│   └── manifest.json        # Manifest file cho PWA
├── dev-dist/                # Thư mục tạo ra bởi Vite PWA Plugin
├── src/                     # Mã nguồn chính
├── vite.config.js           # Cấu hình Vite và PWA
└── README-PWA.md            # Hướng dẫn này
```

## Các công nghệ được sử dụng

- Frontend:
  - React
  - Tailwind CSS
  - Vite
  - Service Worker API

## Lưu ý

- PWA chỉ hoạt động tốt nhất trên kết nối HTTPS hoặc localhost
- Nên kiểm tra trên nhiều thiết bị và trình duyệt khác nhau

## Tính năng PWA

- **Offline Capability**: Ứng dụng có thể hoạt động khi không có mạng
- **Installable**: Có thể cài đặt lên màn hình chính như ứng dụng native
- **Responsive**: Thiết kế thích ứng với nhiều kích thước màn hình

## Tài nguyên tham khảo

- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) 