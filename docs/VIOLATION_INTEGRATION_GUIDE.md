# 🔌 HƯỚNG DẪN TÍCH HỢP - HỆ THỐNG BÁO CÁO VI PHẠM

## 📋 Mục lục

1. [Tích hợp vào trang Đơn hàng của Khách hàng](#1-tích-hợp-vào-trang-đơn-hàng-của-khách-hàng)
2. [Tích hợp vào OrderDetailModal](#2-tích-hợp-vào-orderdetailmodal)
3. [Tích hợp vào trang Lịch sử đơn hàng](#3-tích-hợp-vào-trang-lịch-sử-đơn-hàng)
4. [Tích hợp vào Admin Dashboard](#4-tích-hợp-vào-admin-dashboard)

---

## 1. Tích hợp vào trang Đơn hàng của Khách hàng

### File: `src/pages/user/OrderDetailModal.jsx`

#### Bước 1: Import component

```jsx
import ReportViolationModal from './components/ReportViolationModal';
```

#### Bước 2: Thêm state

```jsx
function OrderDetailModal({ order, open, onClose }) {
   const [showReportModal, setShowReportModal] = useState(false);
   
   // Lấy thông tin tài xế từ item đã giao hàng
   const deliveredItem = order?.items?.find(
      item => item.status === 'Delivered' && item.driverId
   );
   
   const driver = deliveredItem?.driverId;
   
   // ... existing code
}
```

#### Bước 3: Thêm nút "Báo cáo vi phạm" vào footer modal

```jsx
<Modal
   title="Chi tiết đơn hàng"
   open={open}
   onCancel={onClose}
   width={800}
   footer={[
      <Button key="close" onClick={onClose}>
         Đóng
      </Button>,
      
      // Chỉ hiện nút báo cáo khi:
      // - Đơn hàng đã hoàn thành
      // - Có thông tin tài xế
      order?.status === 'Completed' && driver && (
         <Button
            key="report"
            danger
            icon={<WarningOutlined />}
            onClick={() => setShowReportModal(true)}
         >
            Báo cáo vi phạm
         </Button>
      )
   ]}
>
   {/* Existing modal content */}
</Modal>

{/* Thêm ReportViolationModal */}
<ReportViolationModal
   open={showReportModal}
   onClose={() => setShowReportModal(false)}
   driver={driver}
   order={order}
   orderItem={deliveredItem}
   onSuccess={() => {
      message.success('Báo cáo đã được gửi thành công!');
      setShowReportModal(false);
   }}
/>
```

#### ✅ Kết quả:

```
┌─────────────────────────────────────┐
│ Chi tiết đơn hàng                   │
├─────────────────────────────────────┤
│ Mã đơn hàng: #12345678              │
│ Trạng thái: Hoàn thành              │
│ ...                                 │
│                                     │
│ Thông tin tài xế:                   │
│ - Nguyễn Văn A                      │
│ - ⭐ 4.8 (120 chuyến)              │
│ - 📞 0123456789                     │
├─────────────────────────────────────┤
│                  [Đóng] [⚠️ Báo cáo vi phạm] │
└─────────────────────────────────────┘
```

---

## 2. Tích hợp vào OrderDetailModal

### File: `src/pages/user/OrderDetailModal.jsx` (Phiên bản đầy đủ)

```jsx
import React, { useState } from 'react';
import { Modal, Button, Descriptions, Tag, Timeline, message } from 'antd';
import { 
   WarningOutlined, 
   EnvironmentOutlined,
   ClockCircleOutlined 
} from '@ant-design/icons';
import ReportViolationModal from './components/ReportViolationModal';
import { formatDate, formatCurrency } from '../../utils/formatters';

function OrderDetailModal({ order, open, onClose }) {
   const [showReportModal, setShowReportModal] = useState(false);
   
   if (!order) return null;
   
   // Lấy thông tin tài xế từ item đã giao hàng
   const deliveredItem = order.items?.find(
      item => item.status === 'Delivered' && item.driverId
   );
   
   // Extract driver info từ driverId (có thể là string hoặc object)
   const getDriverInfo = () => {
      if (!deliveredItem?.driverId) return null;
      
      const driverId = deliveredItem.driverId;
      
      // Nếu driverId là object đầy đủ
      if (typeof driverId === 'object' && driverId !== null) {
         return {
            _id: driverId._id,
            name: driverId.userId?.name || driverId.name || 'N/A',
            phone: driverId.userId?.phone || driverId.phone || 'N/A',
            avatarUrl: driverId.userId?.avatarUrl || driverId.avatarUrl,
            rating: driverId.rating,
            totalTrips: driverId.totalTrips
         };
      }
      
      return null;
   };
   
   const driverInfo = getDriverInfo();
   const showReportButton = order.status === 'Completed' && driverInfo;
   
   return (
      <>
         <Modal
            title="Chi tiết đơn hàng"
            open={open}
            onCancel={onClose}
            width={800}
            footer={[
               <Button key="close" onClick={onClose}>
                  Đóng
               </Button>,
               showReportButton && (
                  <Button
                     key="report"
                     danger
                     icon={<WarningOutlined />}
                     onClick={() => setShowReportModal(true)}
                  >
                     Báo cáo vi phạm
                  </Button>
               )
            ]}
         >
            {/* Thông tin đơn hàng */}
            <Descriptions bordered column={1}>
               <Descriptions.Item label="Mã đơn hàng">
                  #{order._id?.slice(-8)}
               </Descriptions.Item>
               <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(order.status)}>
                     {getStatusText(order.status)}
                  </Tag>
               </Descriptions.Item>
               <Descriptions.Item label="Điểm lấy hàng">
                  <EnvironmentOutlined className="text-green-500 mr-2" />
                  {order.pickupAddress}
               </Descriptions.Item>
               <Descriptions.Item label="Điểm giao hàng">
                  <EnvironmentOutlined className="text-red-500 mr-2" />
                  {order.dropoffAddress}
               </Descriptions.Item>
               <Descriptions.Item label="Tổng tiền">
                  {formatCurrency(order.totalFee)}
               </Descriptions.Item>
            </Descriptions>
            
            {/* Thông tin tài xế (nếu có) */}
            {driverInfo && (
               <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Thông tin tài xế</h4>
                  <div className="flex items-center space-x-3">
                     {driverInfo.avatarUrl && (
                        <img 
                           src={driverInfo.avatarUrl} 
                           alt={driverInfo.name}
                           className="w-12 h-12 rounded-full"
                        />
                     )}
                     <div>
                        <p className="font-medium">{driverInfo.name}</p>
                        <p className="text-sm text-gray-600">
                           📞 {driverInfo.phone}
                        </p>
                        {driverInfo.rating && (
                           <p className="text-sm">
                              ⭐ {driverInfo.rating.toFixed(1)} 
                              ({driverInfo.totalTrips || 0} chuyến)
                           </p>
                        )}
                     </div>
                  </div>
               </div>
            )}
            
            {/* Timeline giao hàng */}
            <div className="mt-4">
               <h4 className="font-semibold mb-2">Lịch sử giao hàng</h4>
               <Timeline>
                  <Timeline.Item color="green">
                     Đơn hàng đã tạo - {formatDate(order.createdAt, true)}
                  </Timeline.Item>
                  {order.items?.map((item, index) => (
                     <Timeline.Item 
                        key={index}
                        color={getItemStatusColor(item.status)}
                     >
                        {getItemStatusText(item.status)} - 
                        {item.updatedAt && formatDate(item.updatedAt, true)}
                     </Timeline.Item>
                  ))}
               </Timeline>
            </div>
         </Modal>
         
         {/* Report Violation Modal */}
         <ReportViolationModal
            open={showReportModal}
            onClose={() => setShowReportModal(false)}
            driver={deliveredItem?.driverId}
            order={order}
            orderItem={deliveredItem}
            onSuccess={() => {
               message.success('Báo cáo vi phạm đã được gửi thành công!');
               setShowReportModal(false);
            }}
         />
      </>
   );
}

// Helper functions
const getStatusColor = (status) => {
   const colors = {
      'Created': 'blue',
      'InProgress': 'orange',
      'Completed': 'green',
      'Cancelled': 'red'
   };
   return colors[status] || 'default';
};

const getStatusText = (status) => {
   const texts = {
      'Created': 'Đã tạo',
      'InProgress': 'Đang giao',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy'
   };
   return texts[status] || status;
};

const getItemStatusColor = (status) => {
   const colors = {
      'Pending': 'blue',
      'Accepted': 'cyan',
      'PickedUp': 'orange',
      'Delivering': 'purple',
      'Delivered': 'green',
      'Cancelled': 'red'
   };
   return colors[status] || 'default';
};

const getItemStatusText = (status) => {
   const texts = {
      'Pending': 'Chờ nhận',
      'Accepted': 'Đã nhận',
      'PickedUp': 'Đã lấy hàng',
      'Delivering': 'Đang giao',
      'Delivered': 'Đã giao',
      'Cancelled': 'Đã hủy'
   };
   return texts[status] || status;
};

export default OrderDetailModal;
```

---

## 3. Tích hợp vào trang Lịch sử đơn hàng

### File: `src/pages/user/Orders.jsx`

#### Thêm nút "Báo cáo" vào OrderCard:

```jsx
import { WarningOutlined } from '@ant-design/icons';

function Orders() {
   const [reportModalVisible, setReportModalVisible] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState(null);
   
   const handleReport = (order) => {
      setSelectedOrder(order);
      setReportModalVisible(true);
   };
   
   return (
      <div className="p-6">
         {/* Existing orders list */}
         {orders.map(order => (
            <Card key={order._id}>
               {/* Order details */}
               
               {/* Actions */}
               <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleViewDetail(order)}>
                     Xem chi tiết
                  </Button>
                  
                  {/* Chỉ hiện nút báo cáo cho đơn đã hoàn thành */}
                  {order.status === 'Completed' && (
                     <Button 
                        danger 
                        icon={<WarningOutlined />}
                        onClick={() => handleReport(order)}
                     >
                        Báo cáo
                     </Button>
                  )}
               </div>
            </Card>
         ))}
         
         {/* Report Modal */}
         <ReportViolationModal
            open={reportModalVisible}
            onClose={() => setReportModalVisible(false)}
            driver={selectedOrder?.items?.find(
               item => item.status === 'Delivered' && item.driverId
            )?.driverId}
            order={selectedOrder}
            onSuccess={() => {
               message.success('Báo cáo đã được gửi!');
               setReportModalVisible(false);
            }}
         />
      </div>
   );
}
```

---

## 4. Tích hợp vào Admin Dashboard

### File: `src/App.jsx` hoặc Router config

#### Thêm route cho ReportsPage:

```jsx
import ReportsPage from './pages/admin/outlet/ReportsPage';

// Trong routes config:
{
   path: '/admin',
   element: <RequireAdmin><AdminLayout /></RequireAdmin>,
   children: [
      {
         path: 'dashboard',
         element: <AdminDashboard />
      },
      {
         path: 'orders',
         element: <AdminOrders />
      },
      {
         path: 'drivers',
         element: <AdminDrivers />
      },
      {
         path: 'reports',              // MỚI
         element: <ReportsPage />       // MỚI
      }
   ]
}
```

### File: `src/pages/admin/components/AdminNavBar.jsx`

#### Thêm menu item:

```jsx
import { WarningOutlined } from '@ant-design/icons';

const menuItems = [
   {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      path: '/admin/dashboard'
   },
   // ... existing items
   {
      key: 'reports',                    // MỚI
      icon: <WarningOutlined />,         // MỚI
      label: 'Báo cáo vi phạm',          // MỚI
      path: '/admin/reports'             // MỚI
   }
];
```

---

## 🎯 Checklist tích hợp

### ✅ Khách hàng:

- [ ] Import `ReportViolationModal` vào `OrderDetailModal.jsx`
- [ ] Thêm state `showReportModal`
- [ ] Thêm nút "Báo cáo vi phạm" vào footer
- [ ] Thêm `<ReportViolationModal />` component
- [ ] Kiểm tra điều kiện hiển thị (đơn hoàn thành + có tài xế)
- [ ] Test upload ảnh
- [ ] Test submit form

### ✅ Admin:

- [ ] Import `ReportsPage` vào routes
- [ ] Thêm route `/admin/reports`
- [ ] Thêm menu item trong AdminNavBar
- [ ] Kiểm tra middleware auth (chỉ admin)
- [ ] Test xem danh sách báo cáo
- [ ] Test lọc báo cáo
- [ ] Test xử lý và cấm tài xế

---

## 🧪 Test Cases

### Test 1: Khách hàng báo cáo thành công

```
1. Login với tài khoản khách hàng
2. Vào trang Đơn hàng
3. Chọn đơn đã hoàn thành
4. Click "Xem chi tiết"
5. Click "Báo cáo vi phạm"
6. Chọn loại vi phạm: "Trễ giao hàng"
7. Chọn mức độ: "Cao"
8. Nhập mô tả: "Tài xế giao hàng trễ 3 tiếng, không xin lỗi..."
9. Upload 2 ảnh (< 2MB mỗi ảnh)
10. Click "Gửi báo cáo"
11. Xác nhận:
    - Loading spinner hiển thị
    - Message success: "Báo cáo đã được gửi!"
    - Modal tự động đóng
```

### Test 2: Admin xử lý và cấm tài xế

```
1. Login với tài khoản admin
2. Vào trang "Báo cáo vi phạm"
3. Xác nhận stats hiển thị đúng
4. Click "Xem" báo cáo mới nhất
5. Đọc chi tiết báo cáo
6. Click "Xử lý"
7. Chọn trạng thái: "Đã xử lý"
8. Nhập phạt tiền: 500,000
9. Chọn số lần cảnh báo: 2
10. Chọn "Cấm tài xế"
11. Chọn thời gian: "30 ngày"
12. Xác nhận alert cảnh báo hiển thị
13. Nhập ghi chú: "Đã xác minh vi phạm nghiêm trọng..."
14. Click "Cập nhật"
15. Xác nhận:
    - Message: "Đã cập nhật và cấm tài xế thành công"
    - Email gửi cho tài xế
    - Email cảm ơn gửi cho khách hàng
    - Danh sách refresh
```

---

## 📞 Troubleshooting

### Lỗi: "Cannot read property 'driverId' of undefined"

**Nguyên nhân:** Đơn hàng chưa có item nào hoàn thành

**Giải pháp:**
```jsx
const deliveredItem = order?.items?.find(
   item => item.status === 'Delivered' && item.driverId
);

// Kiểm tra trước khi sử dụng
if (!deliveredItem || !deliveredItem.driverId) {
   return null; // Không hiển thị nút báo cáo
}
```

### Lỗi: "Upload ảnh thất bại"

**Nguyên nhân:** Token không được gửi kèm request

**Giải pháp:**
```jsx
// Trong customRequest của Upload
headers: {
   'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### Lỗi: "Admin không thấy báo cáo mới"

**Nguyên nhân:** Cần refresh danh sách

**Giải pháp:**
```jsx
// Sau khi submit thành công
fetchViolations(pagination.current);
```

---

## 🎉 Hoàn thành!

Sau khi tích hợp xong, hệ thống sẽ có đầy đủ chức năng:

✅ Khách hàng báo cáo vi phạm  
✅ Admin xem và quản lý báo cáo  
✅ Admin cấm/mở cấm tài xế  
✅ Tự động gửi email thông báo  

**Next steps:**
- Testing toàn bộ flow
- Training cho admin về cách sử dụng
- Monitor email delivery
- Gather user feedback

---

**Người hướng dẫn:** AI Assistant  
**Ngày tạo:** 2025-01-18  
**Phiên bản:** 1.0.0

