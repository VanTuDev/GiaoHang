# 📋 HỆ THỐNG BÁO CÁO VI PHẠM - FRONTEND

## 🎯 Tổng quan

Giao diện người dùng cho hệ thống báo cáo vi phạm tài xế, bao gồm:
- ✅ Khách hàng báo cáo vi phạm
- ✅ Admin xem và quản lý báo cáo
- ✅ Admin cấm/mở cấm tài xế
- ✅ Hiển thị thông báo email tự động

---

## 📂 Cấu trúc Files

```
FE_GiaoHangDaNang/
├── src/
│   ├── pages/
│   │   ├── user/
│   │   │   └── components/
│   │   │       └── ReportViolationModal.jsx  ✅ Modal báo cáo cho khách hàng
│   │   └── admin/
│   │       └── outlet/
│   │           └── ReportsPage.jsx           ✅ Trang quản lý báo cáo (Admin)
│   └── features/
│       └── violations/
│           └── api/
│               ├── endpoints.js               ✅ Định nghĩa API endpoints
│               └── violationService.js        ✅ Service gọi API
```

---

## 🎨 Giao diện Khách hàng

### `ReportViolationModal.jsx`

**Vị trí:** `src/pages/user/components/ReportViolationModal.jsx`

**Chức năng:**
- Cho phép khách hàng báo cáo vi phạm của tài xế
- Chỉ hiển thị sau khi đơn hàng hoàn thành

**Props:**
```jsx
<ReportViolationModal
   open={boolean}              // Hiển thị modal
   onClose={function}          // Callback khi đóng
   driver={object}             // Thông tin tài xế
   order={object}              // Thông tin đơn hàng
   orderItem={object}          // Item cụ thể (optional)
   onSuccess={function}        // Callback khi báo cáo thành công
/>
```

**Form Fields:**

1. **Loại vi phạm** (Required)
   - Trễ lấy hàng ⏰
   - Trễ giao hàng 🚚
   - Thái độ không tốt 😠
   - Làm hỏng hàng hóa 📦
   - Tính phí quá cao 💰
   - Lái xe không an toàn 🚗
   - Không đến đúng giờ ❌
   - Khác 📝

2. **Mức độ nghiêm trọng** (Required)
   - Thấp (green)
   - Trung bình (orange) - Mặc định
   - Cao (red)
   - Nghiêm trọng (purple)

3. **Mô tả chi tiết** (Required)
   - Min: 20 ký tự
   - Max: 1000 ký tự
   - Với bộ đếm ký tự

4. **Ảnh chứng minh** (Optional)
   - Tối đa 5 ảnh
   - Mỗi ảnh < 2MB
   - Upload lên server

**Features:**
- ✅ Validation đầy đủ
- ✅ Upload ảnh với progress
- ✅ Hiển thị thông tin tài xế và đơn hàng
- ✅ Alert cảnh báo về quy trình xử lý
- ✅ Loading state khi submit
- ✅ Error handling

**Ví dụ sử dụng:**
```jsx
import ReportViolationModal from './components/ReportViolationModal';

function OrderDetail() {
   const [showReportModal, setShowReportModal] = useState(false);
   
   const handleReportSuccess = (data) => {
      message.success('Báo cáo đã được gửi!');
      // Refresh data...
   };
   
   return (
      <>
         <Button 
            danger 
            onClick={() => setShowReportModal(true)}
         >
            Báo cáo vi phạm
         </Button>
         
         <ReportViolationModal
            open={showReportModal}
            onClose={() => setShowReportModal(false)}
            driver={orderDriver}
            order={currentOrder}
            onSuccess={handleReportSuccess}
         />
      </>
   );
}
```

---

## 🛡️ Giao diện Admin

### `ReportsPage.jsx`

**Vị trí:** `src/pages/admin/outlet/ReportsPage.jsx`

**Chức năng:**
- Xem tất cả báo cáo vi phạm
- Lọc theo trạng thái, loại vi phạm, mức độ
- Xem chi tiết báo cáo
- Xử lý báo cáo
- **Cấm tài xế** (MỚI)

#### 1. Dashboard Stats

Hiển thị 4 thẻ thống kê:
- 🟡 **Chờ xử lý** (Pending)
- 🔵 **Đang điều tra** (Investigating)
- 🟢 **Đã xử lý** (Resolved)
- 🔴 **Đã bác bỏ** (Dismissed)

#### 2. Filters

- **Lọc theo trạng thái:** Pending, Investigating, Resolved, Dismissed
- **Lọc theo loại vi phạm:** 8 loại vi phạm
- **Lọc theo mức độ:** Low, Medium, High, Critical
- **Tìm kiếm:** Tìm theo tên, email, mô tả

#### 3. Table hiển thị báo cáo

**Columns:**
- ID báo cáo (8 ký tự đầu)
- Người báo cáo (name, email)
- Tài xế bị báo cáo (name, phone)
- Loại vi phạm (với icon)
- Mức độ (với color tag)
- Trạng thái (với icon)
- Ngày báo cáo
- Thao tác (Xem, Xử lý)

#### 4. Modal Chi tiết báo cáo

Hiển thị đầy đủ thông tin:

**👤 Người báo cáo:**
- Tên, Email
- Ẩn danh hay không
- Ngày báo cáo

**🚗 Tài xế bị báo cáo:**
- Avatar, Tên, Phone, Email
- Rating, Tổng số chuyến
- Trạng thái tài xế

**📦 Đơn hàng liên quan:**
- Mã đơn hàng
- Địa chỉ lấy/giao hàng

**⚠️ Chi tiết vi phạm:**
- Loại vi phạm, Mức độ, Trạng thái
- Mô tả chi tiết
- Ảnh chứng minh (grid 3 cột)

**🛡️ Xử lý của Admin:**
- Admin xử lý, Thời gian xử lý
- Phạt tiền, Số lần cảnh báo
- Ghi chú xử lý

#### 5. Modal Xử lý báo cáo (CẬP NHẬT MỚI)

**Form Fields:**

1. **Trạng thái** (Required)
   - 🟡 Chờ xử lý
   - 🔵 Đang điều tra
   - 🟢 Đã xử lý
   - 🔴 Đã bác bỏ

2. **Phạt tiền** (Optional)
   - Input number với format VND
   - Bước nhảy: 10,000 VND
   - Min: 0

3. **Số lần cảnh báo** (Optional)
   - Input number
   - Min: 0, Max: 10

---

4. **⚠️ CẤM TÀI KHOẢN TÀI XẾ** (MỚI)
   - Radio: Không cấm / Cấm tài xế
   - Nếu chọn "Cấm tài xế":
     - **Thời gian cấm** (Required):
       - 7 ngày
       - 15 ngày
       - 30 ngày
       - 3 tháng
       - 6 tháng
       - 1 năm
       - 🔴 **Vĩnh viễn**

---

5. **Ghi chú xử lý** (Required)
   - TextArea, 4 rows
   - Min: Không giới hạn
   - Placeholder: "Nhập ghi chú về cách xử lý vi phạm này..."

6. **⚠️ Cảnh báo khi cấm** (Conditional)
   - Chỉ hiển thị khi chọn "Cấm tài xế"
   - Alert type error
   - Nội dung: "Khi cấm tài xế, hệ thống sẽ tự động gửi email thông báo cho tài xế và khách hàng. Tài xế sẽ không thể nhận đơn hàng mới."

**Buttons:**
- **Hủy:** Đóng modal
- **Cập nhật:** Submit form

**Khi submit:**
```javascript
{
  "status": "Resolved",
  "adminNotes": "Xác minh tài xế giao hàng trễ 3 giờ",
  "penalty": 500000,
  "warningCount": 2,
  "banDriver": true,           // MỚI
  "banDuration": "30 ngày"     // MỚI
}
```

**Kết quả:**
- ✅ Báo cáo được cập nhật
- ✅ Tài xế bị phạt tiền (nếu có)
- ✅ Tài xế bị cấm (nếu chọn)
- ✅ Email gửi cho tài xế (nếu cấm)
- ✅ Email cảm ơn gửi cho khách hàng (nếu Resolved)
- ✅ Message thông báo kết quả

---

## 🔄 API Integration

### Endpoints sử dụng

```javascript
// violationService.js

export const violationService = {
   // Admin: Lấy tất cả báo cáo
   getAllViolations: (params) => 
      axiosClient.get('/api/violations/admin/all', { params }),
   
   // Admin: Cập nhật trạng thái (ĐÃ CẬP NHẬT)
   updateViolationStatus: (violationId, payload) =>
      axiosClient.put(`/api/violations/admin/${violationId}/status`, payload),
   
   // Customer: Báo cáo vi phạm
   reportViolation: (payload) => 
      axiosClient.post('/api/violations/report', payload),
   
   // Customer: Lấy báo cáo của mình
   getMyReports: (params) => 
      axiosClient.get('/api/violations/my-reports', { params }),
};
```

### Request/Response Examples

**1. Khách hàng báo cáo:**
```javascript
POST /api/violations/report
{
  "driverId": "64abc123...",
  "orderId": "64def456...",
  "violationType": "LateDelivery",
  "description": "Tài xế giao hàng trễ 3 giờ...",
  "photos": ["url1", "url2"],
  "severity": "High"
}

// Response
{
  "success": true,
  "data": { /* violation object */ }
}
```

**2. Admin cập nhật và cấm tài xế:**
```javascript
PUT /api/violations/admin/64jkl789/status
{
  "status": "Resolved",
  "adminNotes": "Đã xác minh vi phạm nghiêm trọng",
  "penalty": 500000,
  "warningCount": 2,
  "banDriver": true,
  "banDuration": "30 ngày"
}

// Response
{
  "success": true,
  "message": "Đã cập nhật và cấm tài xế thành công",
  "data": { /* updated violation */ }
}
```

---

## 🎨 UI/UX Features

### Design Patterns

1. **Color Coding:**
   - 🟡 Yellow/Gold: Pending
   - 🔵 Blue: Investigating
   - 🟢 Green: Resolved
   - 🔴 Red: Dismissed/Critical

2. **Icons:**
   - ⚠️ Warning: Violations
   - ⏰ Clock: Late issues
   - 🚚 Truck: Delivery issues
   - 😠 Angry: Behavior issues
   - 📦 Box: Damaged goods
   - 💰 Money: Overcharging

3. **Gradients:**
   - Header: Red to Orange gradient
   - Stats cards: Unique gradient for each
   - Shadows: Hover effects

### Responsive Design

- Desktop: Full features
- Tablet: Responsive grid
- Mobile: Stack layout

### Loading States

- Table: Skeleton loading
- Submit: Button loading spinner
- Upload: Progress bar

### Error Handling

- Form validation errors
- API error messages
- Network error fallback

---

## 🧪 Testing Guide

### Test Scenarios

#### Khách hàng báo cáo:

1. ✅ Mở modal sau khi đơn hoàn thành
2. ✅ Chọn loại vi phạm
3. ✅ Nhập mô tả (< 20 ký tự → Error)
4. ✅ Upload ảnh (> 2MB → Error)
5. ✅ Submit thành công → Message
6. ✅ Modal tự động đóng

#### Admin xử lý:

1. ✅ Xem danh sách báo cáo
2. ✅ Lọc theo trạng thái
3. ✅ Click "Xem" → Hiển thị chi tiết
4. ✅ Click "Xử lý" → Mở modal
5. ✅ Chọn trạng thái "Resolved"
6. ✅ Nhập phạt tiền: 500,000
7. ✅ Chọn "Cấm tài xế"
8. ✅ Chọn thời gian: "30 ngày"
9. ✅ Nhập ghi chú
10. ✅ Xem alert cảnh báo
11. ✅ Click "Cập nhật"
12. ✅ Xem message kết quả

### Expected Results

**Khi cấm tài xế:**
- ✅ Driver status = "Blocked"
- ✅ Email gửi cho tài xế
- ✅ Email cảm ơn gửi cho khách hàng
- ✅ Báo cáo cập nhật trạng thái
- ✅ Console logs hiển thị
- ✅ Message thông báo thành công

---

## 📝 Code Examples

### 1. Khách hàng báo cáo từ OrderDetailModal

```jsx
import ReportViolationModal from '../components/ReportViolationModal';

function OrderDetailModal({ order, visible, onClose }) {
   const [showReportModal, setShowReportModal] = useState(false);
   
   // Lấy thông tin tài xế từ item đã giao hàng
   const deliveredItem = order.items.find(
      item => item.status === 'Delivered' && item.driverId
   );
   
   const driver = deliveredItem?.driverId;
   
   return (
      <Modal visible={visible} onCancel={onClose}>
         {/* Order details... */}
         
         {order.status === 'Completed' && driver && (
            <Button 
               danger 
               icon={<WarningOutlined />}
               onClick={() => setShowReportModal(true)}
            >
               Báo cáo vi phạm
            </Button>
         )}
         
         <ReportViolationModal
            open={showReportModal}
            onClose={() => setShowReportModal(false)}
            driver={driver}
            order={order}
            orderItem={deliveredItem}
            onSuccess={() => {
               message.success('Báo cáo đã được gửi!');
               setShowReportModal(false);
            }}
         />
      </Modal>
   );
}
```

### 2. Admin xử lý báo cáo

```jsx
// ReportsPage.jsx

const handleUpdateStatus = async () => {
   try {
      const values = await form.validateFields();
      
      // values = {
      //   status: 'Resolved',
      //   penalty: 500000,
      //   warningCount: 2,
      //   banDriver: true,
      //   banDuration: '30 ngày',
      //   adminNotes: '...'
      // }
      
      const response = await violationService.updateViolationStatus(
         selectedViolation._id,
         values
      );
      
      if (response.data?.success) {
         message.success(
            response.data.message || 'Cập nhật thành công'
         );
         setUpdateModalVisible(false);
         fetchViolations(pagination.current);
      }
   } catch (error) {
      message.error('Lỗi cập nhật trạng thái');
   }
};
```

---

## 🚀 Deployment Notes

### Environment Variables

Không cần environment variables đặc biệt cho frontend, API base URL được cấu hình trong `axiosClient`.

### Build

```bash
cd FE_GiaoHangDaNang
npm run build
```

### Dev Server

```bash
npm run dev
# Chạy trên http://localhost:3000
```

---

## 📞 Troubleshooting

### Common Issues

**1. ❌ 404 Not Found khi báo cáo vi phạm:**

**Triệu chứng:**
```
POST http://localhost:3000/api/violations
Status: 404 Not Found
Response: {"success":false,"error":"Không tìm thấy endpoint này"}
```

**Nguyên nhân:** Endpoint sai

**Giải pháp:** ✅ Đã fix trong `endpoints.js`
```javascript
// ❌ SAI
reportViolation: '/api/violations',

// ✅ ĐÚNG
reportViolation: '/api/violations/report',
```

**Xem chi tiết:** `docs/VIOLATION_BUGFIX.md`

---

**2. Modal không hiển thị:**
- Kiểm tra `open` prop
- Kiểm tra `driver` object có tồn tại

**3. Upload ảnh thất bại:**
- Kiểm tra token trong localStorage
- Kiểm tra API endpoint `/api/upload/image`
- Kiểm tra file size < 2MB

**4. Submit báo cáo thất bại:**
- Kiểm tra đơn hàng đã hoàn thành
- Kiểm tra driverId có trong payload
- Kiểm tra description >= 20 ký tự

**5. Cấm tài xế không hoạt động:**
- Kiểm tra `banDriver: true` trong payload
- Kiểm tra `banDuration` đã chọn
- Kiểm tra backend logs

---

## 🎯 Future Enhancements

- [ ] Real-time notifications cho khách hàng
- [ ] Dashboard thống kê chi tiết hơn
- [ ] Export báo cáo ra Excel
- [ ] Lọc theo khoảng thời gian
- [ ] Bulk actions cho nhiều báo cáo
- [ ] Mobile app integration
- [ ] Push notifications

---

**Ngày cập nhật:** 2025-01-18  
**Phiên bản:** 1.0.0  
**Status:** ✅ HOÀN THÀNH

