# 📋 LUỒNG TRUYỀN THÔNG TIN TÀI XẾ

## 🎯 Mục đích
Truyền thông tin tài xế từ `OrderCard` (ngoài) vào `OrderDetailModal` (chi tiết) để đảm bảo hiển thị nhất quán.

---

## 🔄 Luồng dữ liệu

```
OrderCard.jsx
    ↓
    activeDriver (driverId với userId populated)
    ↓
handleViewDetail(orderId, activeDriver)  ← Truyền cả 2 params
    ↓
Orders.jsx (merge driverInfo vào orderData)
    ↓
OrderDetailModal.jsx (hiển thị đầy đủ)
```

---

## 📝 Chi tiết Implementation

### 1. **OrderCard.jsx** - Lấy thông tin driver
```jsx
const activeDriver = order.items.find(item => item.driverId)?.driverId;

// activeDriver structure:
{
  _id: "68cd06add0996c87da56b55e",
  userId: {
    _id: "68c3c4364be93330539717f1",
    name: "Nguyễn Văn A",
    phone: "0123456789",
    avatarUrl: "https://..."
  },
  rating: 5,
  totalTrips: 123,
  avatarUrl: "https://..."
}
```

**Action**: Click button "Xem chi tiết"
```jsx
<Button onClick={() => onViewDetail(order._id, activeDriver)}>
  Xem chi tiết
</Button>
```

---

### 2. **Orders.jsx** - Xử lý và merge data

```jsx
const handleViewDetail = async (orderId, driverInfo = null) => {
  try {
    setLoading(true);
    const response = await orderService.getOrderDetail(orderId);
    
    if (response.data?.success) {
      const orderData = response.data.data;
      
      // MERGE: Nếu có driverInfo từ OrderCard
      if (driverInfo && orderData.items) {
        orderData.items = orderData.items.map(item => {
          if (item.driverId && !item.driverId.userId) {
            // Backend chưa populate đầy đủ -> dùng data từ OrderCard
            return { ...item, driverId: driverInfo };
          }
          return item;
        });
      }
      
      setSelectedOrder(orderData);
      setDetailModalVisible(true);
      await loadOrderFeedbacks(orderId);
    }
  } catch (error) {
    // ...
  }
};
```

**Logic:**
- ✅ Nếu backend đã populate `userId` → dùng data từ backend
- ✅ Nếu backend chưa populate → dùng data từ OrderCard
- ✅ Đảm bảo luôn có đủ thông tin tài xế

---

### 3. **OrderDetailModal.jsx** - Hiển thị thông tin

```jsx
{item.driverId && (
  <div className="bg-gradient-to-br from-purple-50 to-indigo-50">
    <Avatar src={item.driverId.userId?.avatarUrl || item.driverId.avatarUrl} />
    <div className="font-semibold">
      {item.driverId.userId?.name || "Tài xế"}
    </div>
    <div>
      ⭐ {item.driverId.rating || "N/A"} • 
      {item.driverId.totalTrips || 0} chuyến
    </div>
    <div>
      📞 {item.driverId.userId?.phone || "N/A"}
    </div>
  </div>
)}
```

---

## ✅ Lợi ích

### 1. **Đảm bảo data nhất quán**
- OrderCard và OrderDetailModal hiển thị cùng thông tin
- Không bị mất data khi chuyển modal

### 2. **Fallback mechanism**
- Nếu backend chưa populate → dùng data từ OrderCard
- Nếu backend đã populate → dùng data từ backend

### 3. **Performance**
- Không cần call API thêm để lấy driver info
- Tận dụng data đã có từ danh sách orders

---

## 🧪 Test Cases

### Case 1: Backend đã populate đầy đủ
```javascript
// Response từ getOrderDetail
{
  items: [{
    driverId: {
      _id: "xxx",
      userId: {
        name: "Nguyễn Văn A",
        phone: "0123456789"
      },
      rating: 5,
      totalTrips: 123
    }
  }]
}

// Kết quả: Dùng data từ backend ✅
```

### Case 2: Backend chưa populate userId
```javascript
// Response từ getOrderDetail
{
  items: [{
    driverId: "68cd06add0996c87da56b55e" // Chỉ có ID
  }]
}

// activeDriver từ OrderCard
{
  _id: "68cd06add0996c87da56b55e",
  userId: {
    name: "Nguyễn Văn A",
    phone: "0123456789"
  },
  rating: 5,
  totalTrips: 123
}

// Kết quả: Merge data từ OrderCard ✅
```

### Case 3: Không có driver
```javascript
// OrderCard: activeDriver = null
// OrderDetailModal: Không hiển thị section tài xế ✅
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────┐
│  GET /api/orders/my-orders              │
│  Response: orders[] with populated      │
│  items.driverId.userId                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  OrderCard.jsx                          │
│  - Extract activeDriver from order      │
│  - Display: name, rating, trips, phone  │
└─────────────────────────────────────────┘
              ↓ CLICK "Xem chi tiết"
┌─────────────────────────────────────────┐
│  Orders.jsx - handleViewDetail()        │
│  - Receive: orderId + activeDriver      │
│  - Call: GET /api/orders/:orderId       │
│  - Merge: driverInfo if needed          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  OrderDetailModal.jsx                   │
│  - Receive: order (with merged driver)  │
│  - Display: Complete driver info        │
└─────────────────────────────────────────┘
```

---

## 🔍 Debugging

### Kiểm tra activeDriver trong OrderCard:
```javascript
console.log('activeDriver:', activeDriver);
// Expected:
// {
//   _id: "...",
//   userId: { name: "...", phone: "...", avatarUrl: "..." },
//   rating: 5,
//   totalTrips: 123
// }
```

### Kiểm tra merge trong Orders.jsx:
```javascript
console.log('driverInfo from OrderCard:', driverInfo);
console.log('orderData from backend:', orderData);
console.log('merged orderData:', orderData);
```

### Kiểm tra hiển thị trong OrderDetailModal:
```javascript
console.log('item.driverId:', item.driverId);
console.log('item.driverId.userId:', item.driverId.userId);
```

---

## ⚠️ Lưu ý

1. **activeDriver có thể null**: Khi đơn chưa có tài xế (status: Created)
2. **Populate backend**: Đảm bảo backend populate `items.driverId.userId` trong `getCustomerOrders`
3. **Fallback**: Luôn có `|| "N/A"` hoặc `|| 0` để xử lý thiếu data
4. **Props order**: `handleViewDetail(orderId, activeDriver)` - orderId trước, activeDriver sau

---

## ✅ Checklist

- [x] OrderCard truyền `activeDriver` vào `onViewDetail`
- [x] Orders.jsx nhận param `driverInfo` trong `handleViewDetail`
- [x] Merge logic kiểm tra `!item.driverId.userId`
- [x] OrderDetailModal hiển thị đầy đủ thông tin
- [x] Fallback khi thiếu data (`|| "N/A"`)
- [x] Test với đơn có driver
- [x] Test với đơn chưa có driver
- [x] Test với backend chưa populate

**Hoàn tất!** 🎉

