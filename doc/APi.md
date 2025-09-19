## REST API - Hướng dẫn sử dụng

- baseUrl: `http://localhost:8080/api`
- Xác thực: Header `Authorization: Bearer <accessToken>` với API yêu cầu đăng nhập
- Roles: `Customer`, `Driver`, `Admin`
- Content-Type:
  - `application/json` cho JSON
  - `multipart/form-data` cho upload file (key thường dùng: `file`)
- Health check: `GET /healthz` → `{ ok: true, uptime }`

### Quy ước phản hồi & lỗi chung
- Thành công: `{ success: true, data?, message?, meta? }`
- Lỗi 400: `{ success: false, message: '...' }`
- Lỗi 401 thiếu/không hợp lệ token: `{ success: false, message: 'Thiếu access token' | 'Access token không hợp lệ' }`
- Lỗi 403 thiếu quyền: `{ success: false, message: 'Không có quyền truy cập' }`
- Lỗi 404 route không tồn tại: `{ success: false, error: 'Không tìm thấy endpoint này' }`
- Lỗi 5xx: `{ success: false, message: 'Lỗi ...', error: '...' }`

---

## Auth - `/auth`

#### Đăng ký
- POST `{{baseUrl}}/auth/register`
- Body
```json
{
  "name": "Nguyen Van A",
  "phone": "0900000001",
  "password": "secret123",
  "role": "Customer",
  "email": "a@example.com"
}
```
- 201
```json
{ "success": true, "message": "Đăng ký thành công. Vui lòng xác thực email nếu đã cung cấp email." }
```
- Lỗi: 400 thiếu trường; 409 email/phone trùng; 500

#### Xác thực email (OTP)
- POST `{{baseUrl}}/auth/verify-email`
- Body
```json
{ "email": "a@example.com", "code": "123456" }
```
- 200
```json
{ "success": true, "message": "Xác thực email thành công" }
```
- Lỗi: 400 OTP sai/hết hạn; 404 không tìm thấy user; 500

#### Đăng nhập
- POST `{{baseUrl}}/auth/login`
- Body (1 trong 2)
```json
{ "phone": "0900000001", "password": "secret123" }
```
```json
{ "email": "a@example.com", "password": "secret123" }
```
- 200
```json
{
  "success": true,
  "data": {
    "user": { "id": "66f...", "name": "Nguyen Van A", "email": "a@example.com", "phone": "0900000001", "role": "Customer" },
    "accessToken": "eyJ..."
  }
}
```
> Ghi chú: Hệ thống không sử dụng refresh token.

#### User hiện tại
- GET `{{baseUrl}}/auth/me`
- Headers: `Authorization: Bearer {{accessToken}}`
- 200
```json
{ "success": true, "data": { "_id": "...", "name": "...", "email": "...", "phone": "...", "role": "Customer", "address": "Đà Nẵng", "avatarUrl": "..." } }
```

#### Quên/Đặt lại mật khẩu
- POST `{{baseUrl}}/auth/forgot-password` → Body `{ "email": "a@example.com" }` → 200 `{ success, message }`
- POST `{{baseUrl}}/auth/reset-password` → Body `{ "email": "a@example.com", "code": "123456", "newPassword": "..." }` → 200 `{ success, message }`

Ví dụ cURL đăng nhập:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0900000001","password":"secret123"}'
```

---

## Profile - `/profile`

#### Lấy thông tin cá nhân (User)
- GET `{{baseUrl}}/profile/me`
- Headers: `Authorization`
- 200 `{ success, data: user }`

#### Cập nhật thông tin cá nhân (User)
- PUT `{{baseUrl}}/profile/me`
- Headers: `Authorization`, `Content-Type: application/json`
- Body
```json
{ "name": "New Name", "address": "Đà Nẵng" }
```
- 200 `{ success, data: user }`

#### Upload avatar người dùng
- POST `{{baseUrl}}/profile/me/avatar`
- Headers: `Authorization`
- Body (form-data)
  - key: `file` (Type: File)
- 200 `{ success, data: user }`

#### Xem hồ sơ tài xế
- GET `{{baseUrl}}/profile/driver/me`
- Headers: `Authorization (Driver|Admin)`
- 200 `{ success, data: driver(populate vehicleId) }`

#### Cập nhật hồ sơ tài xế
- PUT `{{baseUrl}}/profile/driver/me`
- Headers: `Authorization (Driver|Admin)`, `Content-Type: application/json`
- Body
```json
{ "status": "Active" }
```
- 200 `{ success, data: driver }`

#### Upload avatar tài xế
- POST `{{baseUrl}}/profile/driver/me/avatar`
- Headers: `Authorization (Driver|Admin)`
- Body (form-data): `file`
- 200 `{ success, data: driver }`

#### Tạo/Cập nhật xe của tài xế
- PUT `{{baseUrl}}/profile/vehicle/me`
- Headers: `Authorization (Driver|Admin)`, `Content-Type: application/json`
- Body
```json
{ "type": "TruckSmall", "licensePlate": "43A1-123.45" }
```
- 200 `{ success, data: vehicle }`

#### Upload ảnh xe
- POST `{{baseUrl}}/profile/vehicle/me/photo`
- Headers: `Authorization (Driver|Admin)`
- Body (form-data): `file`
- 200 `{ success, data: vehicle }`

---

## Vehicles (Public) - `/vehicles`

#### Danh sách xe (lọc)
- GET `{{baseUrl}}/vehicles`
- Query
  - `type`: Motorbike | Pickup | TruckSmall | TruckBox | DumpTruck | PickupTruck | Trailer | TruckMedium | TruckLarge
  - `weightKg`: lọc xe có `maxWeightKg >= weightKg`
  - `page`, `limit`
- 200
```json
{
  "success": true,
  "data": [
    { "_id":"...", "type":"TruckSmall", "maxWeightKg":1000, "photoUrl":"...", "licensePlate":"43A1-123.45", "driverId": { "status":"Active", "isOnline": true } }
  ],
  "meta": { "page":1, "limit":12, "total": 25, "totalPages": 3 }
}
```

---

## Orders - `/orders`

#### Tạo đơn (Customer)
- POST `{{baseUrl}}/orders`
- Headers: `Authorization (Customer)`, `Content-Type: application/json`
- Body
```json
{
  "pickupAddress": "Số 1, Hải Châu",
  "dropoffAddress": "Số 2, Liên Chiểu",
  "items": [
    { "vehicleType":"TruckSmall","weightKg":800,"distanceKm":12.5,"loadingService":true,"insurance":true }
  ]
}
```
- 201 trả về order đầy đủ kèm `items[].priceBreakdown` và `totalPrice`.
- Lỗi: 400 thiếu địa chỉ/items; 400 không có xe phù hợp; 500

#### Driver bật/tắt hoạt động
- PUT `{{baseUrl}}/orders/driver/online`
- Headers: `Authorization (Driver)`, `Content-Type: application/json`
- Body
```json
{ "online": true }
```
- 200 `{ success, data: driver }`

#### Driver nhận item trong đơn
- PUT `{{baseUrl}}/orders/:orderId/items/:itemId/accept`
- Headers: `Authorization (Driver)`
- 200: trả về order; item chuyển `status="Accepted"` và có `driverId` hiện tại
- Lỗi: 400 chưa có hồ sơ tài xế; 400 đã có đơn hoạt động; 400 item không khả dụng; 500

#### Driver cập nhật trạng thái item
- PUT `{{baseUrl}}/orders/:orderId/items/:itemId/status`
- Headers: `Authorization (Driver)`, `Content-Type: application/json`
- Body
```json
{ "status": "PickedUp" }
```
- 200: trả về order đã cập nhật (Allowed: PickedUp | Delivering | Delivered | Cancelled)
- Lỗi: 400 trạng thái không hợp lệ; 400 chưa có hồ sơ tài xế; 404 item không phù hợp; 500

---

## Driver Onboarding - `/driver`

#### Nộp hồ sơ tài xế
- POST `{{baseUrl}}/driver/apply`
- Headers: `Authorization`
- Yêu cầu: user phải có `email` và đã xác thực email
- Body (multipart/form-data)
  - Đơn lẻ: `licenseFront`, `licenseBack`, `idFront`, `idBack`, `portrait`
  - Mảng: `vehiclePhotos[]`, `vehicleDocs[]`
- 201 `{ success, data: application }`

#### Xem hồ sơ của tôi
- GET `{{baseUrl}}/driver/my-application`
- Headers: `Authorization`
- 200 `{ success, data: application | null }`

#### Admin - danh sách hồ sơ
- GET `{{baseUrl}}/driver/admin/applications`
- Headers: `Authorization (Admin)`
- Query: `status?=Pending|Approved|Rejected`, `page?`, `limit?`
- 200 `{ success, data: [], meta }`

#### Admin - duyệt/từ chối hồ sơ
- PUT `{{baseUrl}}/driver/admin/applications/:applicationId/review`
- Headers: `Authorization (Admin)`, `Content-Type: application/json`
- Body
```json
{ "action": "approve", "adminNote": "Hồ sơ hợp lệ" }
```
- `approve`: thêm role Driver cho user và upsert `Driver`
- `reject`: đặt `status=Rejected`

---

## Admin - `/admin`

#### Danh sách người dùng
- GET `{{baseUrl}}/admin/users`
- Headers: `Authorization (Admin)`
- Query
  - `role`: Customer | Driver | Admin
  - `search`: chuỗi tìm kiếm theo name/email/phone
  - `page`, `limit`, `sort` (vd: `createdAt:desc`)
- 200 `{ success, data: users[], meta }
`

---

## Ghi chú & Test nhanh
- Khi chưa cấu hình SMTP, OTP sẽ in ở console (test mode) để FE QA.
- Upload cần `multipart/form-data` với key đúng như tài liệu.
- JWT lấy từ `/auth/login`; đặt vào header `Authorization` cho các API cần quyền.

Ví dụ tạo đơn (cURL):
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupAddress":"A",
    "dropoffAddress":"B",
    "items":[{"vehicleType":"TruckSmall","weightKg":800,"distanceKm":12,"loadingService":true,"insurance":false}]
  }'
```
