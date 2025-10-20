# 📸 HƯỚNG DẪN UPLOAD & XEM ẢNH BÁO CÁO VI PHẠM

## 🎯 Tổng quan

Hệ thống cho phép:
- ✅ **Khách hàng:** Upload ảnh chứng cứ khi báo cáo vi phạm
- ✅ **Admin:** Xem và phóng to ảnh trong báo cáo

---

## 📤 Khách hàng - Upload Ảnh

### Giao diện Upload

```
┌────────────────────────────────────────────────────┐
│ 📸 Ảnh chứng minh (tùy chọn) - Tối đa 5 ảnh, < 2MB│
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │      │  │      │  │      │  │  +   │         │
│  │ IMG1 │  │ IMG2 │  │ IMG3 │  │Upload│         │
│  │      │  │      │  │      │  │      │         │
│  └──────┘  └──────┘  └──────┘  └──────┘         │
│                                                    │
│  💡 Mẹo                                           │
│  Ảnh chứng cứ rõ ràng sẽ giúp admin xử lý báo cáo │
│  nhanh hơn và chính xác hơn.                      │
└────────────────────────────────────────────────────┘
```

### Tính năng Upload

**1. Upload Type: `picture-card`**
- Hiển thị preview thumbnail ngay lập tức
- Dễ dàng xem và quản lý ảnh đã upload
- UI đẹp và trực quan

**2. Validation:**
```javascript
✅ File type: Chỉ chấp nhận ảnh (image/*)
✅ File size: Tối đa 2MB mỗi ảnh
✅ Max count: Tối đa 5 ảnh
```

**3. Upload Flow:**
```
1. User chọn file
   ↓
2. beforeUpload validation
   ↓
3. customRequest upload lên server
   ↓
4. Server trả về URL
   ↓
5. onSuccess → Lưu URL
   ↓
6. Submit form → Gửi array URLs
```

### Code Implementation

**File:** `src/pages/user/components/ReportViolationModal.jsx`

```jsx
<Form.Item label={
   <span>
      📸 Ảnh chứng minh (tùy chọn)
      <span className="text-xs text-gray-500 ml-2 font-normal">
         - Tối đa 5 ảnh, mỗi ảnh &lt; 2MB
      </span>
   </span>
}>
   <Upload 
      {...uploadProps}
      listType="picture-card"  // ← Hiển thị dạng card với preview
      maxCount={5}             // ← Giới hạn 5 ảnh
   >
      {fileList.length >= 5 ? null : (
         <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
         </div>
      )}
   </Upload>
   
   <Alert
      message="💡 Mẹo"
      description="Ảnh chứng cứ rõ ràng sẽ giúp admin xử lý báo cáo nhanh hơn và chính xác hơn."
      type="info"
      showIcon
      className="mt-2"
   />
</Form.Item>
```

### Upload Props

```javascript
const uploadProps = {
   name: 'file',
   multiple: true,
   fileList,
   
   // Validation trước khi upload
   beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
         message.error('Chỉ được upload ảnh!');
         return false;
      }
      
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
         message.error('Ảnh phải nhỏ hơn 2MB!');
         return false;
      }
      
      return true;
   },
   
   // Custom upload request
   customRequest: async ({ file, onSuccess, onError }) => {
      try {
         const formData = new FormData();
         formData.append('file', file);
         
         const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
            headers: {
               'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
         });
         
         if (response.ok) {
            const result = await response.json();
            onSuccess(result);  // Lưu URL từ server
         } else {
            onError(new Error('Upload failed'));
         }
      } catch (error) {
         onError(error);
      }
   }
};
```

### Submit Logic

```javascript
const handleSubmit = async (values) => {
   const payload = {
      driverId: driver?._id,
      orderId: order?._id,
      violationType: values.violationType,
      description: values.description,
      
      // Extract URLs từ fileList
      photos: fileList.map(file => 
         file.response?.url || file.url
      ).filter(Boolean),
      
      severity: values.severity,
      isAnonymous: values.isAnonymous
   };
   
   await violationService.reportViolation(payload);
};
```

---

## 👁️ Admin - Xem Ảnh

### Giao diện Xem Ảnh

```
┌────────────────────────────────────────────────────┐
│ 📸 Hình ảnh chứng minh: (Click vào ảnh để xem phóng to) │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │          │  │          │  │          │        │
│  │  IMG 1   │  │  IMG 2   │  │  IMG 3   │        │
│  │          │  │          │  │          │        │
│  │ 👁 Xem   │  │ 👁 Xem   │  │ 👁 Xem   │        │
│  │  ảnh 1   │  │  ảnh 2   │  │  ảnh 3   │        │
│  └──────────┘  └──────────┘  └──────────┘        │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Tính năng Xem

**1. Image Preview Group**
- Click vào bất kỳ ảnh nào để mở preview
- Navigate giữa các ảnh (◀ ▶)
- Zoom in/out
- Rotate
- Download

**2. Grid Layout**
- 3 cột trên desktop
- Responsive cho mobile/tablet
- Fixed height 192px (h-48)
- Object-fit: cover

**3. Hover Effect**
- Opacity giảm khi hover
- Hiển thị mask "Xem ảnh X"
- Cursor pointer

### Code Implementation

**File:** `src/pages/admin/outlet/ReportsPage.jsx`

```jsx
{/* Photos */}
{selectedViolation.photos && selectedViolation.photos.length > 0 && (
   <div className="mt-4">
      <h4 className="font-medium mb-2">
         📸 Hình ảnh chứng minh: 
         <span className="text-sm text-gray-500 ml-2">
            (Click vào ảnh để xem phóng to)
         </span>
      </h4>
      
      <Image.PreviewGroup>  {/* ← Group cho navigation */}
         <div className="grid grid-cols-3 gap-4">
            {selectedViolation.photos.map((photo, index) => (
               <div key={index} className="relative group">
                  <Image
                     src={photo}
                     alt={`Chứng cứ ${index + 1}`}
                     className="rounded-lg object-cover w-full h-48 cursor-pointer hover:opacity-90 transition-opacity"
                     preview={{
                        mask: (
                           <div className="flex flex-col items-center">
                              <EyeOutlined className="text-2xl mb-1" />
                              <span>Xem ảnh {index + 1}</span>
                           </div>
                        )
                     }}
                  />
               </div>
            ))}
         </div>
      </Image.PreviewGroup>
   </div>
)}
```

### Preview Features

**Ant Design Image Preview tự động có:**

1. **Toolbar:**
   - 🔍 Zoom In
   - 🔍 Zoom Out
   - ↻ Rotate Left
   - ↺ Rotate Right
   - 💾 Download
   - ❌ Close

2. **Navigation:**
   - ◀ Previous image
   - ▶ Next image
   - Keyboard: ← →

3. **Gestures:**
   - Click and drag to pan
   - Scroll to zoom
   - Double click to reset

---

## 🎨 UI/UX Improvements

### Khách hàng - Upload

**Before:**
```
[ Upload ảnh chứng minh ]

Tối đa 5 ảnh, mỗi ảnh dưới 2MB.
```

**After:**
```
📸 Ảnh chứng minh (tùy chọn) - Tối đa 5 ảnh, < 2MB

┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│ IMG1 │  │ IMG2 │  │ IMG3 │  │  +   │
└──────┘  └──────┘  └──────┘  └──────┘

💡 Mẹo
Ảnh chứng cứ rõ ràng sẽ giúp admin xử lý báo cáo nhanh hơn.
```

### Admin - View

**Before:**
```
Hình ảnh chứng minh:
[Img1] [Img2] [Img3]
```

**After:**
```
📸 Hình ảnh chứng minh: (Click vào ảnh để xem phóng to)

[    IMG 1     ] [    IMG 2     ] [    IMG 3     ]
[  👁 Xem ảnh  ] [  👁 Xem ảnh  ] [  👁 Xem ảnh  ]
```

---

## 🧪 Testing Guide

### Test Case 1: Upload ảnh thành công

**Steps:**
1. Login với tài khoản khách hàng
2. Mở modal "Báo cáo vi phạm"
3. Click vào upload area
4. Chọn 3 ảnh (mỗi ảnh < 2MB)
5. Verify preview hiển thị
6. Điền các field khác
7. Click "Gửi báo cáo"

**Expected:**
- ✅ 3 ảnh hiển thị preview ngay lập tức
- ✅ Upload progress hiển thị
- ✅ Success message sau khi upload
- ✅ Submit form thành công
- ✅ Backend nhận array URLs

---

### Test Case 2: Validation upload

**Test 2.1: File không phải ảnh**
```
1. Chọn file .pdf
   ↓
Expected: Message "Chỉ được upload ảnh!"
```

**Test 2.2: File quá lớn**
```
1. Chọn ảnh 5MB
   ↓
Expected: Message "Ảnh phải nhỏ hơn 2MB!"
```

**Test 2.3: Quá 5 ảnh**
```
1. Upload 5 ảnh
2. Nút upload biến mất
   ↓
Expected: Không thể upload thêm
```

---

### Test Case 3: Admin xem ảnh

**Steps:**
1. Login với tài khoản Admin
2. Vào "Báo cáo vi phạm"
3. Click "Xem" báo cáo có ảnh
4. Scroll xuống phần "Hình ảnh chứng minh"
5. Verify 3 ảnh hiển thị grid
6. Click vào ảnh 1
7. Verify preview mở
8. Click next (▶)
9. Verify ảnh 2 hiển thị
10. Test zoom in/out
11. Test rotate
12. Click download
13. Close preview

**Expected:**
- ✅ Grid 3 cột hiển thị đẹp
- ✅ Hover effect hoạt động
- ✅ Click mở preview
- ✅ Navigation hoạt động
- ✅ Zoom in/out smooth
- ✅ Rotate hoạt động
- ✅ Download thành công
- ✅ Close preview OK

---

## 📊 Data Flow

### Upload Flow

```
[Khách hàng]
    ↓
Chọn ảnh từ device
    ↓
[Frontend - beforeUpload]
- Validate file type
- Validate file size
    ↓
[Frontend - customRequest]
FormData → POST /api/upload/image
    ↓
[Backend - Upload API]
- Multer middleware
- Cloudinary upload
- Return URL
    ↓
[Frontend - onSuccess]
Store URL in fileList
    ↓
[Frontend - Submit Form]
Extract URLs → photos: [url1, url2, url3]
    ↓
[Backend - Violation API]
Save photos array to violation
```

### View Flow

```
[Admin]
    ↓
GET /api/violations/admin/all
    ↓
[Backend]
Return violations with photos: []
    ↓
[Frontend - ReportsPage]
Render Image.PreviewGroup
    ↓
[User Click Image]
Open Ant Design Image Preview
    ↓
[Preview Modal]
- Display full image
- Navigation controls
- Zoom/Rotate/Download
```

---

## 🔒 Security

### Upload Security

1. **File Type Validation:**
   ```javascript
   const isImage = file.type.startsWith('image/');
   ```

2. **File Size Limit:**
   ```javascript
   const isLt2M = file.size / 1024 / 1024 < 2;
   ```

3. **Authentication:**
   ```javascript
   headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
   }
   ```

4. **Backend Validation:**
   - Multer file filter
   - Cloudinary content check
   - MIME type verification

### View Security

1. **Authorization:**
   - Only admin can view all reports
   - Only reporter can view own reports

2. **Image URLs:**
   - Served via Cloudinary CDN
   - Signed URLs (if configured)
   - HTTPS only

---

## 🎯 Best Practices

### Upload

1. ✅ **Show preview immediately**
2. ✅ **Limit file count** (maxCount)
3. ✅ **Validate before upload** (beforeUpload)
4. ✅ **Show upload progress**
5. ✅ **Allow remove uploaded files**
6. ✅ **Clear error messages**
7. ✅ **Helpful hints** (Alert info)

### View

1. ✅ **Image.PreviewGroup** for navigation
2. ✅ **Grid layout** for organization
3. ✅ **Fixed height** for consistency
4. ✅ **Hover effects** for interactivity
5. ✅ **Clear instructions** (click to view)
6. ✅ **Responsive design**
7. ✅ **Loading states**

---

## 🐛 Troubleshooting

### Upload không hoạt động

**Check:**
1. Backend `/api/upload/image` có hoạt động không?
2. Token có được gửi trong header không?
3. Multer middleware có được config đúng không?
4. Cloudinary credentials có đúng không?

**Debug:**
```javascript
customRequest: async ({ file, onSuccess, onError }) => {
   console.log('📤 Uploading:', file.name);
   try {
      const response = await fetch('/api/upload/image', {...});
      console.log('✅ Upload response:', response);
      // ...
   } catch (error) {
      console.error('❌ Upload error:', error);
   }
}
```

---

### Preview không mở

**Check:**
1. `Image` component từ `antd` đã import đúng chưa?
2. `EyeOutlined` icon đã import chưa?
3. CSS có conflict không?

**Fix:**
```javascript
import { Image } from 'antd';  // ✅ Đúng
import Image from 'antd/lib/image';  // ❌ Sai
```

---

### Ảnh bị lỗi 404

**Check:**
1. URL có đúng format không?
2. Cloudinary URL có expired không?
3. File có tồn tại trên server không?

**Debug:**
```javascript
console.log('Photo URLs:', selectedViolation.photos);
selectedViolation.photos.forEach((url, i) => {
   console.log(`Image ${i}:`, url);
});
```

---

## ✅ Checklist

### Upload Features:
- [x] Upload type: `picture-card`
- [x] Max count: 5 ảnh
- [x] File type validation
- [x] File size validation (< 2MB)
- [x] Preview thumbnails
- [x] Remove uploaded files
- [x] Upload progress
- [x] Error messages
- [x] Info alert

### View Features:
- [x] Grid layout (3 cols)
- [x] Image.PreviewGroup
- [x] Fixed height (h-48)
- [x] Hover effects
- [x] Custom mask
- [x] Click to preview
- [x] Navigation (◀ ▶)
- [x] Zoom in/out
- [x] Rotate
- [x] Download
- [x] Responsive

---

**Ngày tạo:** 2025-01-18  
**Phiên bản:** 1.0.0  
**Status:** ✅ HOÀN THÀNH  
**Features:** Upload & View Images for Violation Reports

