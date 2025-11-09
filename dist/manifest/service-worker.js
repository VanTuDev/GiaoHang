// =================================================================
// SERVICE WORKER CHO POS BAHUNG
// =================================================================
// File này xử lý:
// 1. Cache và cung cấp nội dung khi offline
// =================================================================

const CACHE_NAME = 'pos-bahung-v1';

// Danh sách tài nguyên cần lưu vào cache để sử dụng offline
// Đây là các tệp quan trọng để ứng dụng khởi động được khi không có mạng
const urlsToCache = [
   '/',
   '/login',
   '/index.html',
   '/logo.svg',
   '/src/main.jsx',
   '/src/App.jsx',
   '/src/pages/auth/LoginPage.jsx'
];

// In thông báo khi Service Worker được tải lần đầu
console.log('[ServiceWorker] Script loaded');

// =================================================================
// VÒNG ĐỜI SERVICE WORKER - PHẦN 1: CÀI ĐẶT
// =================================================================
// Sự kiện 'install' được kích hoạt khi Service Worker được cài đặt lần đầu
// hoặc khi có phiên bản mới được triển khai
self.addEventListener('install', (event) => {
   console.log('[ServiceWorker] Install - Dịch vụ đang được cài đặt');

   // waitUntil: đảm bảo Service Worker không được coi là đã cài đặt
   // cho đến khi tất cả các mã bên trong hoàn thành
   event.waitUntil(
      // Mở cache với tên đã định nghĩa
      caches.open(CACHE_NAME)
         .then((cache) => {
            console.log('Lưu cache tài nguyên');
            // Thêm tất cả các URL đã định nghĩa vào cache
            return cache.addAll(urlsToCache);
         })
         .then(() => self.skipWaiting())
      // skipWaiting: Kích hoạt SW mới ngay lập tức, không đợi các tab đóng
   );
});

// =================================================================
// VÒNG ĐỜI SERVICE WORKER - PHẦN 2: KÍCH HOẠT
// =================================================================
// Sự kiện 'activate' được kích hoạt sau khi cài đặt thành công
// Thường dùng để xóa cache cũ từ các phiên bản trước
self.addEventListener('activate', (event) => {
   console.log('[ServiceWorker] Activate - Dịch vụ đã được kích hoạt');

   event.waitUntil(
      // Lấy tất cả cache hiện có
      caches.keys().then((cacheNames) => {
         return Promise.all(
            // Lọc ra các cache không khớp với phiên bản hiện tại
            cacheNames.filter((cacheName) => {
               return cacheName !== CACHE_NAME;
            }).map((cacheName) => {
               // Xóa cache cũ để tiết kiệm dung lượng
               return caches.delete(cacheName);
            })
         );
      }).then(() => self.clients.claim())
      // clients.claim: Cho phép SW mới điều khiển tất cả các client/tab ngay lập tức
   );
});

// =================================================================
// XỬ LÝ REQUEST - OFFLINE CAPABILITY
// =================================================================
// Sự kiện 'fetch' được kích hoạt khi trang web yêu cầu tài nguyên
// Đây là cách chúng ta kiểm soát tài nguyên nào đến từ cache và nào từ mạng
self.addEventListener('fetch', (event) => {
   // Không cache các request đến API
   if (event.request.url.includes('/api/')) {
      return; // Cho phép request đi thẳng đến server
   }

   // Kiểm soát cách phản hồi cho request
   event.respondWith(
      // Kiểm tra xem request có trong cache không
      caches.match(event.request)
         .then((response) => {
            if (response) {
               // Cache hit - trả về response từ cache
               return response;
            }
            // Cache miss - truy cập mạng để lấy tài nguyên
            return fetch(event.request);
         })
         .catch((error) => {
            console.log('Lỗi fetch:', error);
            // Ở đây có thể xử lý trường hợp offline hoàn toàn
            // Ví dụ: trả về trang offline.html
         })
   );
}); 