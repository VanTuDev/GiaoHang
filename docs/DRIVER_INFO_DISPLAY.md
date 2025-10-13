# 📋 HIỂN THỊ THÔNG TIN TÀI XẾ TRONG ORDER

## 🔧 Vấn đề đã sửa

### Trước khi sửa:
- ❌ Tên tài xế không hiển thị trong OrderCard
- ❌ Số chuyến không hiển thị
- ❌ Backend không populate thông tin driver cho customer orders

### Sau khi sửa:
- ✅ Hiển thị đầy đủ: Tên, Rating, Số chuyến, SĐT
- ✅ Backend populate đầy đủ `items.driverId` với `userId`
- ✅ UI đẹp, nhất quán giữa OrderCard và OrderDetailModal

---

## 📊 Cấu trúc dữ liệu Driver

### Response từ API `/api/orders/my-orders`:
```json
{
  "success": true,
  "data": [
    {
      "_id": "68e62e7dbf83e745ebeedc1b",
      "items": [
        {
          "driverId": {
            "_id": "68cd06add0996c87da56b55e",
            "userId": {
              "_id": "68c3c4364be93330539717f1",
              "name": "Nguyễn Văn A",
              "phone": "0123456789",
              "avatarUrl": "https://..."
            },
            "rating": 5,
            "totalTrips": 123,
            "avatarUrl": "https://..."
          },
          "status": "Delivering",
          "vehicleType": "TruckSmall"
        }
      ]
    }
  ]
}
```

### Cấu trúc populate:
```javascript
.populate({
   path: 'items.driverId',
   select: 'userId rating totalTrips avatarUrl',
   populate: {
      path: 'userId',
      select: 'name phone avatarUrl'
   }
})
```

---

## 🎨 UI Components

### 1. OrderCard.jsx
```jsx
{activeDriver ? (
   <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 mb-4">
      <Avatar src={activeDriver.userId?.avatarUrl} />
      <p className="font-semibold">
         {activeDriver.userId?.name || "Tài xế"}
      </p>
      <div className="flex items-center space-x-1">
         <StarFilled /> {activeDriver.rating || "N/A"}
         <span>•</span>
         <span>{activeDriver.totalTrips || 0} chuyến</span>
      </div>
      <PhoneOutlined /> {activeDriver.userId?.phone || "N/A"}
   </div>
) : (
   <div>Đang tìm tài xế...</div>
)}
```

### 2. OrderDetailModal.jsx
- Tương tự OrderCard nhưng layout khác
- Hiển thị trong phần "Thông tin tài xế"
- Có thêm thông tin loại xe

---

## 🔍 Cách lấy thông tin Driver

### Trong OrderCard:
```javascript
const activeDriver = order.items.find(item => item.driverId)?.driverId;
```

### Truy cập thông tin:
```javascript
// Tên tài xế
activeDriver.userId?.name

// Rating
activeDriver.rating

// Số chuyến
activeDriver.totalTrips

// SĐT
activeDriver.userId?.phone

// Avatar (ưu tiên userId.avatarUrl, fallback driverId.avatarUrl)
activeDriver.userId?.avatarUrl || activeDriver.avatarUrl
```

---

## ✅ Checklist đã hoàn thành

### Backend:
- [x] Populate `items.driverId` trong `getCustomerOrders`
- [x] Populate nested `userId` với thông tin name, phone, avatarUrl
- [x] Select đủ field: rating, totalTrips, avatarUrl

### Frontend:
- [x] Hiển thị tên tài xế từ `driverId.userId.name`
- [x] Hiển thị rating và số chuyến
- [x] Format giống VehicleCard: `⭐ 5.0 • 123 chuyến`
- [x] Xử lý fallback khi thiếu dữ liệu
- [x] UI đẹp, responsive, gradient background

---

## 🚀 Test

### Test Case 1: Đơn có tài xế
1. Customer đặt đơn
2. Driver nhận đơn
3. Vào trang Orders của Customer
4. **Kỳ vọng**: Thấy tên tài xế, rating, số chuyến, SĐT

### Test Case 2: Đơn chưa có tài xế
1. Customer đặt đơn mới
2. Chưa có driver nhận
3. **Kỳ vọng**: Hiển thị "Đang tìm tài xế phù hợp"

### Test Case 3: Dữ liệu thiếu
1. Driver không có userId.name
2. **Kỳ vọng**: Hiển thị "Tài xế" thay vì undefined
3. Rating thiếu → "N/A"
4. SĐT thiếu → "N/A"

---

## 📝 Notes

- Avatar có 2 nguồn: `userId.avatarUrl` (ưu tiên) và `driverId.avatarUrl` (fallback)
- Format số chuyến: `totalTrips || 0` để tránh undefined
- UI sử dụng gradient purple-indigo cho driver info
- Khi đơn đã giao, có thể đánh giá và báo cáo

