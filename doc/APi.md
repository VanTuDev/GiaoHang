Quick Delivery API Documentation (Full)
Base URL: http://localhost:8080/api

Tất cả các API được nhóm theo feature. Mỗi mục gồm: tên chức năng, endpoint, headers, request, response, và mô tả chức năng.

Authentication - Đăng ký tài khoản
Endpoint: [POST] http://localhost:8080/api/auth/register
Headers:
•	Content-Type: application/json
Request:
{ "name":"Nguyen Van A","phone":"0900000001","password":"secret123","role":"Customer","email":"a@example.com" }
Response:
{ "success": true, "message": "Đăng ký thành công. Vui lòng xác thực email nếu đã cung cấp email." }
Chức năng: Tạo tài khoản mới cho người dùng


Authentication - Xác thực email
Endpoint: [POST] http://localhost:8080/api/auth/verify-email
Headers:
•	Content-Type: application/json
Request:
{ "email":"a@example.com","code":"123456"}
Response:
{ "success": true, "message": "Xác thực email thành công" }
Chức năng: Xác nhận email hợp lệ


Authentication - Đăng nhập
Endpoint: [POST] http://localhost:8080/api/auth/login
Headers:
•	Content-Type: application/json
Request:
{ "phone":"0900000001","password":"secret123"}
Response:
{ "success": true, "data": { "user": { "id":"...", "name":"Nguyen Van A"}, "accessToken":"eyJ..." } }
Chức năng: Đăng nhập và cấp access token


Authentication - Lấy thông tin user hiện tại
Endpoint: [GET] http://localhost:8080/api/auth/me
Headers:
•	Authorization: Bearer <token>
Response:
{ "success": true, "data": { "_id":"...","name":"...","email":"...","phone":"...","role":"Customer"} }
Chức năng: Lấy thông tin user từ token


Authentication - Quên mật khẩu
Endpoint: [POST] http://localhost:8080/api/auth/forgot-password
Headers:
•	Content-Type: application/json
Request:
{ "email":"a@example.com" }
Response:
{ "success": true, "message": "Đã gửi mã xác nhận" }
Chức năng: Gửi mã đặt lại mật khẩu


Authentication - Đặt lại mật khẩu
Endpoint: [POST] http://localhost:8080/api/auth/reset-password
Headers:
•	Content-Type: application/json
Request:
{ "email":"a@example.com","code":"123456","newPassword":"newSecret"}
Response:
{ "success": true, "message": "Đặt lại mật khẩu thành công" }
Chức năng: Đổi mật khẩu bằng mã xác thực


Profile - Lấy thông tin cá nhân
Endpoint: [GET] http://localhost:8080/api/profile/me
Headers:
•	Authorization: Bearer <token>
Response:
{ "success": true, "data": { "_id":"...","name":"...","email":"...","phone":"...","role":"Customer"} }
Chức năng: Xem thông tin user hiện tại


Profile - Cập nhật thông tin cá nhân
Endpoint: [PUT] http://localhost:8080/api/profile/me
Headers:
•	Authorization: Bearer <token>
•	Content-Type: application/json
Request:
{ "name":"New Name","address":"Đà Nẵng"}
Response:
{ "success": true, "data": { "_id":"...","name":"New Name","address":"Đà Nẵng"} }
Chức năng: Cập nhật thông tin cơ bản


Profile - Upload avatar user
Endpoint: [POST] http://localhost:8080/api/profile/me/avatar
Headers:
•	Authorization: Bearer <token>
•	Content-Type: multipart/form-data
Request:
file: <File>
Response:
{ "success": true, "data": { "_id":"...","avatarUrl":"https://..." } }
Chức năng: Cập nhật avatar user


Profile - Xem hồ sơ tài xế
Endpoint: [GET] http://localhost:8080/api/profile/driver/me
Headers:
•	Authorization: Bearer <driverToken>
Response:
{ "success": true, "data": { "_id":"...","status":"Active","isOnline":true} }
Chức năng: Xem trạng thái hồ sơ tài xế


Profile - Cập nhật hồ sơ tài xế
Endpoint: [PUT] http://localhost:8080/api/profile/driver/me
Headers:
•	Authorization: Bearer <driverToken>
•	Content-Type: application/json
Request:
{ "status":"Active"}
Response:
{ "success": true, "data": { "_id":"...","status":"Active"} }
Chức năng: Cập nhật trạng thái hồ sơ


Profile - Upload avatar tài xế
Endpoint: [POST] http://localhost:8080/api/profile/driver/me/avatar
Headers:
•	Authorization: Bearer <driverToken>
•	Content-Type: multipart/form-data
Request:
file: <File>
Response:
{ "success": true, "data": { "_id":"...","avatarUrl":"https://..." } }
Chức năng: Cập nhật avatar tài xế


Profile - Cập nhật khu vực hoạt động & online
Endpoint: [PUT] http://localhost:8080/api/profile/driver/me/areas
Headers:
•	Authorization: Bearer <driverToken>
•	Content-Type: application/json
Request:
{ "serviceAreas":["Quận Hải Châu","Quận Thanh Khê"],"isOnline":true }
Response:
{ "success": true, "data": { "_id":"...","serviceAreas":["Quận Hải Châu"],"isOnline":true } }
Chức năng: Thiết lập khu vực hoạt động


Upload - Upload 1 ảnh
Endpoint: [POST] http://localhost:8080/api/upload/image
Headers:
•	Authorization: Bearer <token>
•	Content-Type: multipart/form-data
Request:
file: <File>, folder: vehicles
Response:
{ "success": true, "data": { "url":"https://...","publicId":"vehicles/abcdef"} }
Chức năng: Upload 1 ảnh qua server


Upload - Upload nhiều ảnh
Endpoint: [POST] http://localhost:8080/api/upload/images
Headers:
•	Authorization: Bearer <token>
•	Content-Type: multipart/form-data
Request:
files: [File1, File2], folder: vehicles
Response:
{ "success": true, "data": [ { "url":"https://...1" }, { "url":"https://...2" } ] }
Chức năng: Upload nhiều ảnh một lần


Vehicles - Lấy danh sách loại xe
Endpoint: [GET] http://localhost:8080/api/vehicles/types
Response:
{ "success": true, "data": [ { "type":"TruckSmall","label":"Xe tải nhỏ","pricePerKm":40000} ] }
Chức năng: Hiển thị danh sách loại xe


Vehicles - Tìm kiếm xe
Endpoint: [GET] http://localhost:8080/api/vehicles?type=TruckSmall&onlineOnly=true
Response:
{ "success": true, "data": [ { "_id":"...","type":"TruckSmall","driverId":{ "isOnline":true } } ] }
Chức năng: Khách hàng lọc xe theo nhu cầu


Vehicles - Driver thêm xe
Endpoint: [POST] http://localhost:8080/api/vehicles
Headers:
•	Authorization: Bearer <driverToken>
Request:
{ "type":"TruckSmall","licensePlate":"43A-123.45","maxWeightKg":1000,"photoUrl":"https://..." }
Response:
{ "success": true, "data": { "_id":"...","type":"TruckSmall"} }
Chức năng: Driver khai báo xe mới


Vehicles - Driver cập nhật xe
Endpoint: [PUT] http://localhost:8080/api/vehicles/:vehicleId
Headers:
•	Authorization: Bearer <driverToken>
Request:
{ "status":"Active","photoUrl":"https://...new.jpg"}
Response:
{ "success": true, "data": { "_id":"...","status":"Active"} }
Chức năng: Cập nhật thông tin xe


Vehicles - Driver xoá xe
Endpoint: [DELETE] http://localhost:8080/api/vehicles/:vehicleId
Headers:
•	Authorization: Bearer <driverToken>
Response:
{ "success": true, "message": "Đã xoá xe thành công" }
Chức năng: Xoá xe khỏi hệ thống


Vehicles - Driver xem xe của tôi
Endpoint: [GET] http://localhost:8080/api/vehicles/my-vehicles
Headers:
•	Authorization: Bearer <driverToken>
Response:
{ "success": true, "data": [ { "_id":"...","type":"TruckSmall"} ] }
Chức năng: Quản lý xe đã khai báo


Orders - Customer tạo đơn
Endpoint: [POST] http://localhost:8080/api/orders
Headers:
•	Authorization: Bearer <token>
•	Content-Type: application/json
Request:
{ "pickupAddress":"Số 1","dropoffAddress":"Số 2","items":[{"vehicleType":"TruckSmall","weightKg":800,"distanceKm":12.5,"loadingService":true,"insurance":true}] }
Response:
{ "success": true, "data": { "_id":"...","totalPrice":650000,"items":[{"status":"Created"}] } }
Chức năng: Khách hàng đặt đơn


Orders - Customer xem đơn của tôi
Endpoint: [GET] http://localhost:8080/api/orders/my-orders
Headers:
•	Authorization: Bearer <token>
Response:
{ "success": true, "data": [ { "_id":"...","totalPrice":650000} ] }
Chức năng: Xem lịch sử đơn hàng


Orders - Driver bật/tắt online
Endpoint: [PUT] http://localhost:8080/api/orders/driver/online
Headers:
•	Authorization: Bearer <driverToken>
•	Content-Type: application/json
Request:
{ "online": true }
Response:
{ "success": true, "data": { "_id":"...","isOnline":true} }
Chức năng: Driver bật/tắt trạng thái online


Orders - Driver xem đơn khả dụng
Endpoint: [GET] http://localhost:8080/api/orders/driver/available
Headers:
•	Authorization: Bearer <driverToken>
Response:
{ "success": true, "data": [ { "_id":"...","items":[{"status":"Created"}] } ] }
Chức năng: Danh sách đơn khả dụng


Orders - Driver nhận mục đơn
Endpoint: [PUT] http://localhost:8080/api/orders/:orderId/items/:itemId/accept
Headers:
•	Authorization: Bearer <driverToken>
Response:
{ "success": true, "data": { "_id":"...","items":[{"_id":"itemId","status":"Accepted"}] } }
Chức năng: Driver nhận một mục đơn


Orders - Driver cập nhật trạng thái mục đơn
Endpoint: [PUT] http://localhost:8080/api/orders/:orderId/items/:itemId/status
Headers:
•	Authorization: Bearer <driverToken>
•	Content-Type: application/json
Request:
{ "status":"PickedUp" }
Response:
{ "success": true, "data": { "_id":"...","items":[{"_id":"itemId","status":"PickedUp"}] } }
Chức năng: Driver cập nhật tiến trình giao hàng


Orders - Xem chi tiết đơn hàng
Endpoint: [GET] http://localhost:8080/api/orders/:orderId
Headers:
•	Authorization: Bearer <token>
Response:
{ "success": true, "data": { "_id":"...","pickupAddress":"...","dropoffAddress":"..."} }
Chức năng: Tra cứu chi tiết đơn hàng


Driver Onboarding - Nộp hồ sơ tài xế
Endpoint: [POST] http://localhost:8080/api/driver/apply
Headers:
•	Authorization: Bearer <token>
•	Content-Type: multipart/form-data
Request:
licenseFront: <File>, licenseBack: <File>, idFront: <File>, idBack: <File>, portrait: <File>, vehiclePhotos[], vehicleDocs[]
Response:
{ "success": true, "data": { "_id":"...","status":"Pending"} }
Chức năng: Khách hàng nộp hồ sơ xin làm tài xế


Driver Onboarding - Xem hồ sơ đã nộp
Endpoint: [GET] http://localhost:8080/api/driver/my-application
Headers:
•	Authorization: Bearer <token>
Response:
{ "success": true, "data": { "_id":"...","status":"Pending"} }
Chức năng: Theo dõi tình trạng duyệt hồ sơ


Driver Onboarding (Admin) - Danh sách hồ sơ tài xế
Endpoint: [GET] http://localhost:8080/api/driver/admin/applications
Headers:
•	Authorization: Bearer <adminToken>
Response:
{ "success": true, "data": [ { "_id":"...","status":"Pending"} ] }
Chức năng: Admin xem danh sách hồ sơ


Driver Onboarding (Admin) - Chi tiết hồ sơ tài xế
Endpoint: [GET] http://localhost:8080/api/driver/admin/applications/:applicationId
Headers:
•	Authorization: Bearer <adminToken>
Response:
{ "success": true, "data": { "_id":"...","docs":{ "licenseFrontUrl":"https://..." } } }
Chức năng: Admin xem chi tiết hồ sơ


Driver Onboarding (Admin) - Duyệt hồ sơ tài xế
Endpoint: [PUT] http://localhost:8080/api/driver/admin/applications/:applicationId/review
Headers:
•	Authorization: Bearer <adminToken>
•	Content-Type: application/json
Request:
{ "action":"approve","adminNote":"Hồ sơ đầy đủ"}
Response:
{ "success": true, "data": { "_id":"...","status":"Approved"} }
Chức năng: Admin duyệt hoặc từ chối hồ sơ


Admin - Dashboard tổng quan
Endpoint: [GET] http://localhost:8080/api/admin/dashboard
Headers:
•	Authorization: Bearer <adminToken>
Response:
{ "success": true, "data": { "users":120,"drivers":35,"orders":540,"revenue":123456789 } }
Chức năng: Admin theo dõi chỉ số tổng quan


Admin - Danh sách người dùng
Endpoint: [GET] http://localhost:8080/api/admin/users
Headers:
•	Authorization: Bearer <adminToken>
Response:
{ "success": true, "data": [ { "_id":"...","name":"...","role":"Customer"} ] }
Chức năng: Admin quản lý user


Admin - Danh sách tài xế
Endpoint: [GET] http://localhost:8080/api/admin/drivers
Headers:
•	Authorization: Bearer <adminToken>
Response:
{ "success": true, "data": [ { "_id":"...","status":"Active"} ] }
Chức năng: Admin quản lý driver


Admin - Danh sách đơn hàng
Endpoint: [GET] http://localhost:8080/api/admin/orders
Headers:
•	Authorization: Bearer <adminToken>
Response:
{ "success": true, "data": [ { "_id":"...","totalPrice":1230000} ] }
Chức năng: Admin quản lý đơn hàng


Admin - Báo cáo doanh thu
Endpoint: [GET] http://localhost:8080/api/admin/revenue?period=monthly&year=2024
Headers:
•	Authorization: Bearer <adminToken>
Response:
{ "success": true, "data": [ { "month":1,"revenue":10000000 },{ "month":2,"revenue":12000000 } ] }
Chức năng: Admin xem doanh thu


