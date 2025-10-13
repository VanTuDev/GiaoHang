# 🐛 DEBUG - DRIVER INFO KHÔNG HIỂN THỊ

## 🔍 Các bước debug

### 1. Mở Console (F12)
```
Chrome DevTools → Console tab
```

### 2. Click vào "Xem chi tiết" đơn hàng

### 3. Kiểm tra Logs

#### A. Trong OrderCard (khi click):
```javascript
🔍 [Orders] handleViewDetail called with: {
  orderId: "68e62e7dbf83e745ebeedc1b",
  driverInfo: {
    _id: "68cd06add0996c87da56b55e",
    userId: {
      name: "Nguyễn Văn A",
      phone: "0123456789",
      avatarUrl: "https://..."
    },
    rating: 5,
    totalTrips: 123
  }
}
```

**✅ Kiểm tra:**
- `orderId` có đúng không?
- `driverInfo` có data đầy đủ không?
- `userId` có `name`, `phone`, `avatarUrl` không?

---

#### B. API Response:
```javascript
🔍 [Orders] API response: {
  success: true,
  data: {
    _id: "68e62e7dbf83e745ebeedc1b",
    items: [{
      driverId: "68cd06add0996c87da56b55e",  // ← CHỈ CÓ ID (string)
      status: "Delivering",
      vehicleType: "TruckSmall"
    }]
  }
}
```

**✅ Kiểm tra:**
- `items[].driverId` là gì?
  - Nếu là **string** → Backend chưa populate
  - Nếu là **object** → Kiểm tra có `userId` không

---

#### C. Before Merge:
```javascript
🔍 [Orders] orderData.items BEFORE merge: [{
  driverId: "68cd06add0996c87da56b55e",  // String ID
  status: "Delivering"
}]
```

---

#### D. Processing:
```javascript
🔍 [Orders] Processing item: {
  itemId: "xxx",
  driverId: "68cd06add0996c87da56b55e",  // String
  hasUserId: false  // ← KHÔNG CÓ userId
}

🔧 [Orders] Merging driverInfo for item: xxx
```

**✅ Nếu thấy log này → MERGE THÀNH CÔNG**

---

#### E. After Merge:
```javascript
🔍 [Orders] orderData.items AFTER merge: [{
  driverId: {
    _id: "68cd06add0996c87da56b55e",
    userId: {
      name: "Nguyễn Văn A",
      phone: "0123456789",
      avatarUrl: "https://..."
    },
    rating: 5,
    totalTrips: 123
  },
  status: "Delivering"
}]
```

**✅ Kiểm tra:**
- `driverId` giờ là **object** (không còn string)
- Có `userId` với đầy đủ `name`, `phone`, `avatarUrl`

---

#### F. Trong OrderDetailModal:
```javascript
🔍 [OrderDetailModal] item.driverId: {
  _id: "68cd06add0996c87da56b55e",
  userId: {
    name: "Nguyễn Văn A",
    phone: "0123456789",
    avatarUrl: "https://..."
  },
  rating: 5,
  totalTrips: 123
}

🔍 [OrderDetailModal] typeof: object

🔍 [OrderDetailModal] driverInfo: {
  name: "Nguyễn Văn A",
  phone: "0123456789",
  avatarUrl: "https://...",
  rating: 5,
  totalTrips: 123
}
```

**✅ Nếu thấy logs này → HIỂN THỊ THÀNH CÔNG**

---

## 🚨 Các trường hợp lỗi

### Case 1: `driverInfo` trong OrderCard là `null`
```javascript
🔍 [Orders] handleViewDetail called with: {
  orderId: "xxx",
  driverInfo: null  // ← VẤN ĐỀ
}
```

**Nguyên nhân:** OrderCard không tìm thấy driver
```javascript
const activeDriver = order.items.find(item => item.driverId)?.driverId;
// → undefined nếu không có item nào có driverId
```

**Giải pháp:** Kiểm tra `order.items` có `driverId` không

---

### Case 2: `driverId` từ backend đã populate nhưng thiếu data
```javascript
🔍 [Orders] orderData.items BEFORE merge: [{
  driverId: {
    _id: "xxx",
    // ← THIẾU userId
  }
}]
```

**Nguyên nhân:** Backend populate sai
```javascript
// Backend controller:
.populate('items.driverId', 'userId rating totalTrips')  // ✅ Đúng
.populate('items.driverId')  // ❌ Sai - thiếu fields
```

**Giải pháp:** Kiểm tra backend `getOrderDetail`

---

### Case 3: Merge không chạy
```javascript
🔍 [Orders] Processing item: {
  itemId: "xxx",
  driverId: { ... },
  hasUserId: true  // ← ĐÃ CÓ userId
}

// Không có log "Merging driverInfo"
```

**Nguyên nhân:** Backend đã populate đầy đủ → không cần merge

**Giải pháp:** Kiểm tra backend có populate đúng không

---

### Case 4: `getDriverInfo` return `null`
```javascript
🔍 [OrderDetailModal] item.driverId: "68cd06add0996c87da56b55e"  // String
🔍 [OrderDetailModal] typeof: string
🔍 [OrderDetailModal] driverInfo: null  // ← RETURN NULL
```

**Nguyên nhân:** 
- `driverId` vẫn là string (merge thất bại)
- `getDriverInfo` return `null` khi input là string

**Giải pháp:** Kiểm tra merge logic trong `handleViewDetail`

---

## ✅ Checklist Debug

### 1. Kiểm tra OrderCard
- [ ] `activeDriver` có data đầy đủ?
- [ ] `activeDriver.userId` có `name`, `phone`?
- [ ] `onViewDetail(order._id, activeDriver)` được gọi đúng?

### 2. Kiểm tra Orders.jsx
- [ ] `driverInfo` được truyền vào `handleViewDetail`?
- [ ] API response có `items[].driverId`?
- [ ] Merge logic chạy đúng?
- [ ] `orderData.items` sau merge có `driverId.userId`?

### 3. Kiểm tra OrderDetailModal
- [ ] `item.driverId` là object (không phải string)?
- [ ] `getDriverInfo` return object (không phải null)?
- [ ] UI hiển thị tên, avatar, rating, phone?

### 4. Kiểm tra Backend
- [ ] `getCustomerOrders` populate `items.driverId.userId`?
- [ ] `getOrderDetail` populate đầy đủ?
- [ ] Response trả về đúng structure?

---

## 🛠️ Fix nhanh

### Nếu backend chưa populate:
```javascript
// BE_GiaoHangDaNang/controllers/orderController.js
export const getOrderDetail = async (req, res) => {
  const order = await Order.findById(orderId)
    .populate('items.driverId', 'userId rating totalTrips')
    .populate({
      path: 'items.driverId',
      populate: {
        path: 'userId',
        select: 'name phone avatarUrl'
      }
    });
  
  return res.json({ success: true, data: order });
};
```

### Nếu merge không chạy:
```javascript
// Sửa logic merge
if (item.driverId) {
  const isString = typeof item.driverId === 'string';
  const hasUserId = item.driverId.userId?.name;
  
  if (isString || !hasUserId) {
    return { ...item, driverId: driverInfo };
  }
}
```

---

## 📊 Expected Flow

```
1. Click "Xem chi tiết"
   ↓
2. handleViewDetail(orderId, activeDriver)
   ↓ activeDriver = { userId: {...}, rating, totalTrips }
   
3. API call: getOrderDetail(orderId)
   ↓ Response: items[].driverId = "xxx" (string)
   
4. Merge: driverId = activeDriver
   ↓ items[].driverId = { userId: {...}, rating, totalTrips }
   
5. OrderDetailModal: getDriverInfo(item.driverId)
   ↓ Extract: { name, phone, avatarUrl, rating, totalTrips }
   
6. Render: ✅ Hiển thị đầy đủ
```

---

## 🎯 Kết luận

**Nếu vẫn không hiển thị:**
1. Check console logs từng bước
2. So sánh với expected logs ở trên
3. Tìm bước nào return sai
4. Fix theo hướng dẫn

**Logs quan trọng nhất:**
- ✅ `driverInfo` từ OrderCard
- ✅ `orderData.items AFTER merge`
- ✅ `driverInfo` trong Modal

**Nếu cả 3 đều OK → UI phải hiển thị!** 🎉

