# Thư mục public trong dự án POS_BAHUNG_FE

Thư mục này chứa các tài nguyên tĩnh được phục vụ trực tiếp mà không cần qua quá trình biên dịch. Đây là các file quan trọng cho PWA (Progressive Web App).

## Các file chính và mục đích

### 1. manifest.json

File này định nghĩa các thuộc tính cho Progressive Web App, cho phép người dùng cài đặt ứng dụng lên màn hình chính.

```json
{
  "name": "POS Bahung - Hệ thống quản lý bán hàng",  // Tên đầy đủ của ứng dụng
  "short_name": "POS Bahung",                        // Tên ngắn hiển thị dưới biểu tượng
  "description": "Hệ thống quản lý bán hàng dành cho doanh nghiệp vừa và nhỏ",
  "start_url": "/login",                             // URL khởi động khi mở ứng dụng
  "display": "standalone",                           // Hiển thị như ứng dụng native
  "background_color": "#ffffff",                     // Màu nền khi ứng dụng đang tải
  "theme_color": "#4a90e2",                          // Màu chủ đạo ảnh hưởng đến UI
  "gcm_sender_id": "103953800507",                   // ID cho Push API (Firebase)
  "icons": [
    {
      "src": "/logo.svg",                            // Đường dẫn đến biểu tượng
      "sizes": "192x192 512x512",                    // Các kích thước hỗ trợ
      "type": "image/svg+xml",                       // Định dạng file
      "purpose": "any maskable"                      // Kiểu biểu tượng (adaptive icon)
    }
  ],
  "orientation": "portrait",                         // Hướng hiển thị ưu tiên
  "lang": "vi-VN",                                   // Ngôn ngữ
  "categories": ["business", "productivity"],        // Phân loại ứng dụng
  "screenshots": []                                  // Ảnh chụp màn hình (trống)
}
```

### 2. service-worker.js

Service Worker là thành phần cốt lõi của PWA, cho phép:
- Cache tĩnh và động để hoạt động offline
- Nhận và hiển thị Push Notification
- Xử lý Background Sync khi mất kết nối

Tham khảo comments trong file để hiểu chi tiết từng phần.

### 3. logo.svg

Biểu tượng chính của ứng dụng ở định dạng SVG:
- Được sử dụng trong manifest.json
- Hiển thị trong thông báo
- Xuất hiện trên màn hình chính khi cài đặt

## Cấu trúc thư mục

### 1. Thư mục icons/

Chứa các biểu tượng PNG với nhiều kích thước khác nhau cho PWA:
- 192x192: Biểu tượng Android
- 512x512: Biểu tượng độ phân giải cao
- maskable icons: Biểu tượng có thể điều chỉnh hình dạng

### 2. Thư mục img/

Chứa các hình ảnh tĩnh được sử dụng trong ứng dụng, bao gồm:
- UI elements
- Background images
- Hình ảnh nội dung

### 3. Thư mục logo/

Các biến thể và kích thước khác nhau của logo ứng dụng.

## Hướng dẫn bảo trì và cập nhật

### Cập nhật manifest.json:

1. Khi đổi tên ứng dụng:
   - Thay đổi cả `name` và `short_name`
   - Cập nhật `description` nếu cần

2. Khi thêm biểu tượng mới:
   - Thêm vào mảng `icons` với các thuộc tính phù hợp
   - Đảm bảo có đủ các kích thước cho nhiều thiết bị

3. Khi thay đổi URL khởi động:
   - Cập nhật `start_url` (ví dụ từ "/login" thành "/dashboard")

### Cập nhật Service Worker:

1. Khi thay đổi cache strategy:
   - Tăng version trong `CACHE_NAME` (ví dụ: 'pos-bahung-v2')
   - Cập nhật danh sách `urlsToCache` nếu có tài nguyên mới

2. Khi sửa đổi lớn:
   - Comment rõ ràng các thay đổi
   - Test kỹ trên nhiều thiết bị và trình duyệt

## Lưu ý quan trọng

1. Các tài nguyên trong thư mục public được tham chiếu bằng đường dẫn tuyệt đối:
   - Đúng: `<img src="/logo.svg">`
   - Sai: `<img src="logo.svg">`

2. Khi thêm tài nguyên mới, cần cân nhắc:
   - Có nên thêm vào cache mặc định không?
   - Có cần hỗ trợ nhiều kích thước màn hình không?

3. Push Notification yêu cầu:
   - HTTPS
   - Quyền từ người dùng
   - Đăng ký Service Worker 